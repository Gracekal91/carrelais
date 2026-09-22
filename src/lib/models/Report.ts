import mongoose, { Schema, Document, Model } from "mongoose";
import { ReportType, ReportStatus } from "@/lib/db/schema";

export interface IReport extends Document {
  type: ReportType;
  targetType: "LISTING" | "DEALER";
  targetId: string;
  targetTitle: string;
  reason: string;
  reporterEmail?: string;
  sellerId?: string;
  sellerName?: string;
  status: ReportStatus;
  resolvedAt?: string;
  resolvedBy?: string;
  resolutionNote?: string;
  createdAt: string;
  updatedAt: string;
}

const ReportSchema = new Schema<IReport>(
  {
    type: { type: String, required: true, index: true },
    targetType: { type: String, required: true, index: true },
    targetId: { type: String, required: true, index: true },
    targetTitle: { type: String, required: true },
    reason: { type: String, required: true },
    reporterEmail: { type: String },
    sellerId: { type: String },
    sellerName: { type: String },
    status: {
      type: String,
      enum: ["NEW", "IN_PROGRESS", "RESOLVED", "REJECTED"],
      default: "NEW",
      index: true,
    },
    resolvedAt: { type: String },
    resolvedBy: { type: String },
    resolutionNote: { type: String },
    createdAt: { type: String, default: () => new Date().toISOString(), index: true },
    updatedAt: { type: String, default: () => new Date().toISOString() },
  },
  {
    timestamps: true,
  }
);

export const ReportModel: Model<IReport> =
  mongoose.models.Report || mongoose.model<IReport>("Report", ReportSchema);
