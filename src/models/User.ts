import mongoose, { Schema, Document, Model } from "mongoose";

export interface IUser extends Document {
  name: string;
  email: string;
  password?: string;
  image?: string;
  role: "customer" | "moderator" | "admin";
  /** What a moderator may do (see lib/permissions.ts). Admins can do everything. */
  permissions?: string[];
  provider: "credentials" | "google" | "github";
  phone?: string;
  resetTokenHash?: string;
  resetTokenExpires?: Date;
  coinBalance: number;
  /** null = waiting for email verification; undefined = existing account (treated as verified). */
  emailVerified?: Date | null;
  verifyTokenHash?: string;
  verifyTokenExpires?: Date;
  address?: {
    street?: string;
    city?: string;
    postalCode?: string;
  };
  createdAt: Date;
  updatedAt: Date;
}

const UserSchema = new Schema<IUser>(
  {
    name: {
      type: String,
      required: [true, "Name is required"],
      trim: true,
    },
    email: {
      type: String,
      required: [true, "Email is required"],
      unique: true,
      lowercase: true,
      trim: true,
    },
    password: {
      type: String,
      select: false, // Don't return password in queries by default
    },
    image: {
      type: String,
      default: "",
    },
    // Password reset: only a hash of the emailed token is stored
    coinBalance: { type: Number, default: 0, min: 0 },
    emailVerified: { type: Date, default: undefined },
    verifyTokenHash: { type: String, select: false },
    verifyTokenExpires: { type: Date, select: false },
    resetTokenHash: { type: String, select: false },
    resetTokenExpires: { type: Date, select: false },
    permissions: { type: [String], default: [] },
    role: {
      type: String,
      enum: ["customer", "moderator", "admin"],
      default: "customer",
    },
    provider: {
      type: String,
      enum: ["credentials", "google", "github"],
      default: "credentials",
    },
    phone: {
      type: String,
      default: "",
    },
    address: {
      street: { type: String, default: "" },
      city: { type: String, default: "" },
      postalCode: { type: String, default: "" },
    },
  },
  {
    timestamps: true,
  },
);

const User: Model<IUser> =
  mongoose.models.User || mongoose.model<IUser>("User", UserSchema);

export default User;
