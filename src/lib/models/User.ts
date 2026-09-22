import mongoose, { Schema, Document, Model } from "mongoose";

export type Role = "SUPER_ADMIN" | "ADMIN" | "USER";
export type AccountType = "INDIVIDUAL" | "DEALERSHIP";
export type UserStatus = "ACTIVE" | "SUSPENDED" | "DISABLED";

export interface IUser extends Document {
  email: string;
  password?: string;
  firstName: string;
  lastName: string;
  phone: string;
  role: Role;
  accountType: AccountType;
  status: UserStatus;
  dealershipName?: string;
  location?: string;
  city?: string;
  commune?: string;
  address?: string;
  description?: string;
  logo?: string;
  isVerified?: boolean;
  whatsapp?: string;
  foundedYear?: number;
  businessHours?: Record<string, string>;
  website?: string;
  facebook?: string;
  instagram?: string;
  tiktok?: string;
  joinedAt: string;
  createdAt: Date;
  updatedAt: Date;
}

const UserSchema = new Schema<IUser>(
  {
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
      index: true,
    },
    password: {
      type: String,
      required: true,
    },
    firstName: {
      type: String,
      required: true,
      trim: true,
    },
    lastName: {
      type: String,
      required: true,
      trim: true,
    },
    phone: {
      type: String,
      required: true,
      trim: true,
    },
    role: {
      type: String,
      enum: ["SUPER_ADMIN", "ADMIN", "USER"],
      default: "USER",
      index: true,
    },
    accountType: {
      type: String,
      enum: ["INDIVIDUAL", "DEALERSHIP"],
      default: "INDIVIDUAL",
      index: true,
    },
    status: {
      type: String,
      enum: ["ACTIVE", "SUSPENDED", "DISABLED"],
      default: "ACTIVE",
      index: true,
    },
    dealershipName: { type: String, trim: true },
    location: { type: String, trim: true },
    city: { type: String, trim: true },
    commune: { type: String, trim: true },
    address: { type: String, trim: true },
    description: { type: String, trim: true },
    logo: { type: String, trim: true },
    isVerified: { type: Boolean, default: false },
    whatsapp: { type: String, trim: true },
    foundedYear: { type: Number },
    businessHours: { type: Schema.Types.Mixed },
    website: { type: String, trim: true },
    facebook: { type: String, trim: true },
    instagram: { type: String, trim: true },
    tiktok: { type: String, trim: true },
    joinedAt: {
      type: String,
      default: () => new Date().toISOString(),
    },
  },
  {
    timestamps: true,
  }
);

export const UserModel: Model<IUser> =
  mongoose.models.User || mongoose.model<IUser>("User", UserSchema);
