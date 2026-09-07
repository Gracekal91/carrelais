export type SellerType = "DEALERSHIP" | "INDIVIDUAL";
export type VehicleAvailability = "IN_CONGO" | "IMPORT";
export type VehicleStatus = "DRAFT" | "PENDING_REVIEW" | "PUBLISHED" | "SOLD" | "REJECTED";
export type Transmission = "Automatic" | "Manual" | "CVT" | "Automated Manual";
export type FuelType = "Petrol" | "Diesel" | "Hybrid" | "Electric" | "Plug-in Hybrid";
export type BodyType = "SUV" | "Sedan" | "Hatchback" | "Pickup" | "Coupe" | "Van" | "Wagon" | "Convertible";

export interface Seller {
  id: string;
  type: SellerType;
  name: string;
  isVerified: boolean;
  phone?: string;
  whatsapp?: string;
  location?: string;
  joinedAt: string;
}

export interface VehicleListing {
  id: string;
  slug: string;
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
  condition: "New" | "Used";
  location: string;
  availability: VehicleAvailability;
  description: string;
  images: string[];
  seller: Seller;
  createdAt: string;
  updatedAt: string;
  status: VehicleStatus;
  isFeatured: boolean;
  isVerified: boolean;
  engineSize?: string;
  color?: string;
  features?: string[];
}
