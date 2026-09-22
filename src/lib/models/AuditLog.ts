import mongoose, { Schema, Document, Model } from "mongoose";
import { AuditAction } from "@/lib/db/schema";

export interface IAuditLog extends Document {
  adminId: string;
  adminName: string;
  action: AuditAction;
  targetType: "LISTING" | "USER" | "DEALER" | "REPORT";
  targetId: string;
  targetLabel: string;
  details?: string;
  timestamp: string;
}

const AuditLogSchema = new Schema<IAuditLog>(
  {
    adminId: { type: String, required: true, index: true },
    adminName: { type: String, required: true },
    action: { type: String, required: true, index: true },
    targetType: { type: String, required: true },
    targetId: { type: String, required: true },
    targetLabel: { type: String, required: true },
    details: { type: String },
    timestamp: { type: String, default: () => new Date().toISOString(), index: true },
  },
  {
    timestamps: true,
  }
);

export const AuditLogModel: Model<IAuditLog> =
  mongoose.models.AuditLog || mongoose.model<IAuditLog>("AuditLog", AuditLogSchema);
