import mongoose, { Schema, Model } from "mongoose";

export interface IAuditLog {
  actorEmail: string;
  actorName: string;
  actorRole: "admin" | "moderator";
  action: string;
  detail: string;
  createdAt: Date;
}

/** Who did what in the admin panel, so the owner can see what moderators changed. */
const AuditLogSchema = new Schema<IAuditLog>(
  {
    actorEmail: { type: String, required: true, index: true },
    actorName: { type: String, default: "" },
    actorRole: { type: String, enum: ["admin", "moderator"], required: true },
    action: { type: String, required: true },
    detail: { type: String, default: "", maxlength: 300 },
  },
  { timestamps: { createdAt: true, updatedAt: false } },
);

const AuditLogModel: Model<IAuditLog> =
  mongoose.models.AuditLog || mongoose.model<IAuditLog>("AuditLog", AuditLogSchema);

export default AuditLogModel;
