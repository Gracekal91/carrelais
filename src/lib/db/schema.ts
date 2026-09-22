import { SellerType, VehicleAvailability, VehicleStatus, FuelType, Transmission, BodyType, Seller, VehicleListing } from "@/types";

export type Role = "USER" | "ADMIN";

export interface User {
  id: string;
  email: string;
  password?: string; // dummy auth
  firstName: string;
  lastName: string;
  phone: string;
  role: Role;
  accountType: SellerType;
  // Dealership specific
  dealershipName?: string;
  location?: string;
  description?: string;
  logo?: string;
  joinedAt: string;
  isVerified?: boolean;
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
}

// Global in-memory DB definition
export interface Database {
  users: User[];
  listings: ExtendedVehicleListing[];
}
