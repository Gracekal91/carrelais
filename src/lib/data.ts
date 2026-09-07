import { Seller, VehicleListing } from "@/types";
import { db } from "./db";

export const dummyVehicles = db.listings;

export const getVehicleBySlug = (slug: string) => {
  return db.listings.find(v => v.slug === slug);
};

export const getFeaturedVehicles = () => {
  return db.listings.filter(v => v.isFeatured && v.status === "PUBLISHED");
};

