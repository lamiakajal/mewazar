import { connectToDatabase } from "@/lib/mongodb";
import { getStaff } from "@/lib/admin";
import AuditLogModel from "@/models/AuditLog";

/** Records an admin action for the Activity page. It never breaks the action itself. */
export async function logAction(action: string, detail = ""): Promise<void> {
  try {
    const staff = await getStaff();
    if (!staff) return;
    await connectToDatabase();
    await AuditLogModel.create({
      actorEmail: staff.email,
      actorName: staff.name,
      actorRole: staff.role,
      action,
      detail: detail.slice(0, 300),
    });
  } catch (error) {
    console.error("Audit log failed:", error);
  }
}
