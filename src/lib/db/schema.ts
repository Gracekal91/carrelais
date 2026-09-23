import { SellerType, VehicleAvailability, VehicleStatus, FuelType, Transmission, BodyType, Seller, VehicleListing } from "@/types";

export type Role = "USER" | "ADMIN" | "SUPER_ADMIN";
export type UserStatus = "ACTIVE" | "SUSPENDED" | "DISABLED";

export interface User {
  id: string;
  email: string;
  password?: string; // dummy auth
  firstName: string;
  lastName: string;
  phone: string;
  role: Role;
  accountType: SellerType;
  status?: UserStatus;
  // Dealership specific
  dealershipName?: string;
  location?: string;
  description?: string;
  logo?: string;
  joinedAt: string;
  isVerified?: boolean;
  isEmailVerified?: boolean;
  whatsapp?: string;
  city?: string;
  commune?: string;
  address?: string;
  foundedYear?: number;
  businessHours?: Record<string, string>;
  website?: string;
  facebook?: string;
  instagram?: string;
  tiktok?: string;
}

export interface ApprovalHistoryItem {
  date: string;
  adminName: string;
  action: "SUBMITTED" | "APPROVED" | "REJECTED" | "SUSPENDED" | "REACTIVATED";
  reason?: string;
  comment?: string;
}

export interface ExtendedVehicleListing extends VehicleListing {
  ownerId: string;
  views: number;
  contacts: number;
  chats: number;
  phoneClicks: number;
  dailyStats: {
    date: string;
    views: number;
    contacts: number;
  }[];
  isNegotiable: boolean;
  financeAvailable: boolean;
  doors?: number;
  seats?: number;
  serviceHistory?: string;
  accidentHistory?: string;
  rejectionReason?: string;
  rejectionComment?: string;
  approvedAt?: string;
  approvedBy?: string;
  approvalHistory?: ApprovalHistoryItem[];
}

export type ReportType = 
  | "FRAUD" 
  | "INCORRECT_INFO" 
  | "ALREADY_SOLD" 
  | "MISLEADING_PRICE" 
  | "WRONG_PHOTOS" 
  | "INAPPROPRIATE" 
  | "OTHER";

export type ReportStatus = "NEW" | "IN_PROGRESS" | "RESOLVED" | "REJECTED";

export interface MarketplaceReport {
  id: string;
  type: ReportType;
  targetType: "LISTING" | "DEALER";
  targetId: string;
  targetTitle: string;
  reason: string;
  reporterEmail?: string;
  sellerId?: string;
  sellerName?: string;
  createdAt: string;
  status: ReportStatus;
  resolvedAt?: string;
  resolvedBy?: string;
  resolutionNote?: string;
}

export type AuditAction = 
  | "LISTING_APPROVED" 
  | "LISTING_REJECTED" 
  | "LISTING_SUSPENDED" 
  | "LISTING_UNPUBLISHED" 
  | "LISTING_DELETED"
  | "USER_SUSPENDED" 
  | "USER_REACTIVATED" 
  | "USER_DELETED"
  | "DEALER_VERIFIED" 
  | "DEALER_UNVERIFIED" 
  | "REPORT_RESOLVED" 
  | "REPORT_REJECTED";

export interface AdminAuditLog {
  id: string;
  adminId: string;
  adminName: string;
  action: AuditAction;
  targetType: "LISTING" | "USER" | "DEALER" | "REPORT";
  targetId: string;
  targetLabel: string;
  details?: string;
  timestamp: string;
}

// Global in-memory DB definition
export interface Database {
  users: User[];
  listings: ExtendedVehicleListing[];
  reports: MarketplaceReport[];
  auditLogs: AdminAuditLog[];
}
