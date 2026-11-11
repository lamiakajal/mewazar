import { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import GoogleProvider from "next-auth/providers/google";
import GitHubProvider from "next-auth/providers/github";
import bcrypt from "bcryptjs";
import { connectToDatabase } from "@/lib/mongodb";
import User from "@/models/User";
import { isAdminEmail } from "@/lib/admin-emails";
import { rateLimit } from "@/lib/rate-limit";

export const authOptions: NextAuthOptions = {
  session: {
    strategy: "jwt",
  },
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID || "",
      clientSecret: process.env.GOOGLE_CLIENT_SECRET || "",
    }),
    GitHubProvider({
      clientId: process.env.GITHUB_CLIENT_ID || "",
      clientSecret: process.env.GITHUB_CLIENT_SECRET || "",
    }),
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials, req) {
        if (!credentials?.email || !credentials?.password) {
          throw new Error("Email and password are required");
        }

        // Slow down password guessing: 8 tries per 15 minutes per address and IP
        const forwarded = (req?.headers as Record<string, string | string[] | undefined> | undefined)?.["x-forwarded-for"];
        const ip = String(Array.isArray(forwarded) ? forwarded[0] : forwarded ?? "unknown").split(",")[0].trim();
        if (!(await rateLimit(`login:${ip}:${credentials.email.toLowerCase()}`, 8, 15 * 60 * 1000))) {
          throw new Error("Too many attempts. Please wait a few minutes and try again.");
        }

        await connectToDatabase();

        const user = await User.findOne({
          email: credentials.email.toLowerCase(),
        }).select("+password");

        // One generic message so nobody can find out which emails have accounts
        if (!user || !user.password) {
          throw new Error("Invalid email or password");
        }

        const isMatch = await bcrypt.compare(
          credentials.password,
          user.password,
        );

        if (!isMatch) {
          throw new Error("Invalid email or password");
        }

        // New email/password accounts must confirm their address first (older accounts are unaffected)
        if (user.emailVerified === null) {
          throw new Error("Please confirm your email first. We sent you a link. Check your spam folder too.");
        }

        return {
          id: user._id.toString(),
          name: user.name,
          email: user.email,
          image: user.image || "",
          role: user.role,
        };
      },
    }),
  ],
  callbacks: {
    async signIn({ user, account }) {
      if (!user.email) return false;

      if (account?.provider === "google" || account?.provider === "github") {
        await connectToDatabase();

        const userEmail = user.email.toLowerCase();
        const existingUser = await User.findOne({ email: userEmail });

        if (!existingUser) {
          await User.create({
            name: user.name || "Customer",
            email: userEmail,
            image: user.image || "",
            provider: account.provider,
            role: isAdminEmail(userEmail) ? "admin" : "customer",
          });
        } else if (isAdminEmail(userEmail) && existingUser.role !== "admin") {
          // Google and GitHub verify the email address, so promotion is safe here.
          existingUser.role = "admin";
          await existingUser.save();
        }
      }
      return true;
    },
    async jwt({ token, user, account }) {
      if (account) token.provider = account.provider;

      // Staff roles can change while someone is signed in: re-read the role every 5 minutes
      if (!user && token.email && (!token.roleCheckedAt || Date.now() - Number(token.roleCheckedAt) > 5 * 60 * 1000)) {
        try {
          await connectToDatabase();
          const fresh = await User.findOne({ email: String(token.email).toLowerCase() })
            .select("role")
            .lean<{ role?: string }>();
          token.role = fresh?.role || "customer";
          token.roleCheckedAt = Date.now();
        } catch {
          // keep the previous role if the database is unreachable
        }
      }

      if (user) {
        // Always use our own database id and role (OAuth ids belong to the provider)
        await connectToDatabase();
        const dbUser = await User.findOne({ email: user.email?.toLowerCase() })
          .select("_id role")
          .lean<{ _id: { toString(): string }; role?: string }>();
        token.id = dbUser ? dbUser._id.toString() : user.id;
        token.role = dbUser?.role || "customer";
        token.roleCheckedAt = Date.now();
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        (session.user as { id?: string }).id = token.id as string;
        (session.user as { role?: string }).role = token.role as string;
        (session.user as { provider?: string }).provider = token.provider as string | undefined;
      }
      return session;
    },
  },
  pages: {
    signIn: "/login",
  },
  secret: process.env.NEXTAUTH_SECRET,
};
