import mongoose, { Schema, Model } from "mongoose";
import { VehicleStatus, FuelType, Transmission, BodyType, VehicleAvailability, SellerType } from "@/types";

export interface IApprovalHistory {
  date: string;
  adminName: string;
  action: "SUBMITTED" | "APPROVED" | "REJECTED" | "SUSPENDED" | "REACTIVATED";
  reason?: string;
  comment?: string;
}

export interface IDailyStat {
  date: string;
  views: number;
  contacts: number;
}

export interface ISeller {
  id: string;
  type: SellerType;
  name: string;
  isVerified: boolean;
  phone?: string;
  whatsapp?: string;
  location?: string;
  joinedAt: string;
}

export interface IListing {
  _id?: any;
  slug: string;
  ownerId: string;
  title: string;
  make: string;
  model: string;
  year: number;
  price: number;
  currency: string;
  mileage: number;
  fuelType: FuelType;
  transmission: Transmission;
  bodyType: BodyType;
  condition: string;
  location: string;
  city?: string;
  commune?: string;
  availability: VehicleAvailability;
  listingAvailability?: string;
  description: string;
  images: string[];
  seller: ISeller;
  createdAt: string;
  updatedAt: string;
  status: VehicleStatus;
  isFeatured: boolean;
  isVerified: boolean;
  isNegotiable: boolean;
  financeAvailable: boolean;
  engineSize?: string;
  color?: string;
  interiorColor?: string;
  horsepower?: number;
  doors?: number;
  seats?: number;
  drivetrain?: string;
  steeringSide?: string;
  features?: string[];
  serviceHistory?: string;
  accidentHistory?: string;
  isImported?: boolean;
  importYear?: number;
  customsStatus?: string;
  documents?: string[];
  rejectionReason?: string;
  rejectionComment?: string;
  approvedAt?: string;
  approvedBy?: string;
  approvalHistory?: IApprovalHistory[];
  views: number;
  contacts: number;
  chats: number;
  phoneClicks: number;
  dailyStats: IDailyStat[];
}

const DailyStatSchema = new Schema(
  {
    date: { type: String, required: true },
    views: { type: Number, default: 0 },
    contacts: { type: Number, default: 0 },
  },
  { _id: false }
);

const ApprovalHistorySchema = new Schema(
  {
    date: { type: String, required: true },
    adminName: { type: String, required: true },
    action: { type: String, required: true },
    reason: { type: String },
    comment: { type: String },
  },
  { _id: false }
);

const ListingSchema = new Schema<IListing>(
  {
    slug: { type: String, required: true, unique: true, index: true },
    ownerId: { type: String, required: true, index: true },
    title: { type: String, required: true, trim: true },
    make: { type: String, required: true, trim: true, index: true },
    model: { type: String, required: true, trim: true, index: true },
    year: { type: Number, required: true, index: true },
    price: { type: Number, required: true, min: 0, index: true },
    currency: { type: String, default: "USD" },
    mileage: { type: Number, required: true, min: 0 },
    fuelType: { type: String, required: true },
    transmission: { type: String, required: true },
    bodyType: { type: String, required: true },
    condition: { type: String, required: true },
    location: { type: String, required: true },
    city: { type: String, trim: true },
    commune: { type: String, trim: true },
    availability: { type: String, default: "IN_CONGO" },
    listingAvailability: { type: String, default: "AVAILABLE" },
    description: { type: String, default: "" },
    images: { type: [String], default: [] },
    seller: {
      id: { type: String, required: true },
      type: { type: String, required: true },
      name: { type: String, required: true },
      isVerified: { type: Boolean, default: false },
      phone: { type: String },
      whatsapp: { type: String },
      location: { type: String },
      joinedAt: { type: String },
    },
    status: {
      type: String,
      enum: ["DRAFT", "PENDING_REVIEW", "PUBLISHED", "SOLD", "REJECTED", "EXPIRED", "SUSPENDED"],
      default: "PENDING_REVIEW",
      index: true,
    },
    isFeatured: { type: Boolean, default: false, index: true },
    isVerified: { type: Boolean, default: false },
    isNegotiable: { type: Boolean, default: false },
    financeAvailable: { type: Boolean, default: false },
    engineSize: { type: String },
    color: { type: String },
    interiorColor: { type: String },
    horsepower: { type: Number },
    doors: { type: Number, default: 4 },
    seats: { type: Number, default: 5 },
    drivetrain: { type: String },
    steeringSide: { type: String },
    features: { type: [String], default: [] },
    serviceHistory: { type: String },
    accidentHistory: { type: String },
    isImported: { type: Boolean, default: false },
    importYear: { type: Number },
    customsStatus: { type: String },
    documents: { type: [String], default: [] },
    rejectionReason: { type: String },
    rejectionComment: { type: String },
    approvedAt: { type: String },
    approvedBy: { type: String },
    approvalHistory: { type: [ApprovalHistorySchema], default: [] },
    views: { type: Number, default: 0 },
    contacts: { type: Number, default: 0 },
    chats: { type: Number, default: 0 },
    phoneClicks: { type: Number, default: 0 },
    dailyStats: { type: [DailyStatSchema], default: [] },
    createdAt: { type: String, default: () => new Date().toISOString(), index: true },
    updatedAt: { type: String, default: () => new Date().toISOString() },
  },
  {
    timestamps: true,
  }
);

// Search and filtering compound indexes
ListingSchema.index({ status: 1, createdAt: -1 });
ListingSchema.index({ status: 1, isFeatured: 1 });
ListingSchema.index({ status: 1, make: 1, model: 1 });
ListingSchema.index({ status: 1, price: 1 });
ListingSchema.index({ status: 1, year: 1 });
ListingSchema.index({ ownerId: 1, status: 1 });

export const ListingModel: Model<IListing> =
  mongoose.models.Listing || mongoose.model<IListing>("Listing", ListingSchema);
