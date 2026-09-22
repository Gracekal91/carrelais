import { VehicleListing } from "@/types";
import { ExtendedVehicleListing, User } from "@/lib/db/schema";
import { connectToDatabase } from "@/lib/mongodb";
import { ListingModel } from "@/lib/models/Listing";

/**
 * Format a MongoDB Listing document into a plain JSON ExtendedVehicleListing object
 */
export function formatListing(doc: any): ExtendedVehicleListing {
  if (!doc) return doc;
  const id = doc._id ? doc._id.toString() : (doc.id || "");
  const plain = JSON.parse(JSON.stringify(doc));
  delete plain._id;
  delete plain.__v;
  return {
    ...plain,
    id,
  } as ExtendedVehicleListing;
}

/**
 * Format a MongoDB User document into a plain JSON safe User object (omits password)
 */
export function formatUser(doc: any): User {
  if (!doc) return doc;
  const id = doc._id ? doc._id.toString() : (doc.id || "");
  const plain = JSON.parse(JSON.stringify(doc));
  delete plain._id;
  delete plain.__v;
  delete plain.password; // Never leak password hashes
  return {
    ...plain,
    id,
  } as User;
}

/**
 * Format a MongoDB Report document into a plain JSON safe object
 */
export function formatReport(doc: any): any {
  if (!doc) return doc;
  const id = doc._id ? doc._id.toString() : (doc.id || "");
  const plain = JSON.parse(JSON.stringify(doc));
  delete plain._id;
  delete plain.__v;
  return {
    ...plain,
    id,
  };
}

/**
 * Find a single published listing by its unique slug
 */
export async function getVehicleBySlug(slug: string): Promise<ExtendedVehicleListing | null> {
  try {
    await connectToDatabase();
    const listing = await ListingModel.findOne({ slug }).lean();
    if (!listing) return null;
    return formatListing(listing);
  } catch (error) {
    console.error("Error fetching vehicle by slug:", error);
    return null;
  }
}

/**
 * Fetch featured published listings
 */
export async function getFeaturedVehicles(limit = 8): Promise<ExtendedVehicleListing[]> {
  try {
    await connectToDatabase();
    const listings = await ListingModel.find({ isFeatured: true, status: "PUBLISHED" })
      .sort({ createdAt: -1 })
      .limit(limit)
      .lean();
    return listings.map(formatListing);
  } catch (error) {
    console.error("Error fetching featured vehicles:", error);
    return [];
  }
}

/**
 * Fetch published vehicles physically available in Congo
 */
export async function getLocalVehicles(limit = 4): Promise<ExtendedVehicleListing[]> {
  try {
    await connectToDatabase();
    const listings = await ListingModel.find({ availability: "IN_CONGO", status: "PUBLISHED" })
      .sort({ createdAt: -1 })
      .limit(limit)
      .lean();
    return listings.map(formatListing);
  } catch (error) {
    console.error("Error fetching local vehicles:", error);
    return [];
  }
}

export interface VehicleSearchParams {
  q?: string;
  make?: string;
  model?: string;
  minPrice?: string;
  maxPrice?: string;
  minYear?: string;
  maxYear?: string;
  availability?: string;
  condition?: string;
  transmission?: string;
  fuelType?: string;
  sort?: string;
  page?: string;
  pageSize?: number;
}

/**
 * Search and paginate published vehicles with filter queries
 */
export async function getPublishedVehicles(params: VehicleSearchParams) {
  try {
    await connectToDatabase();

    const filter: Record<string, any> = {
      status: "PUBLISHED",
    };

    if (params.q) {
      const qRegex = new RegExp(params.q.trim(), "i");
      filter.$or = [
        { title: qRegex },
        { make: qRegex },
        { model: qRegex },
        { description: qRegex },
      ];
    }

    if (params.make) {
      filter.make = new RegExp(`^${params.make.trim()}$`, "i");
    }

    if (params.model) {
      filter.model = new RegExp(params.model.trim(), "i");
    }

    if (params.minPrice || params.maxPrice) {
      filter.price = {};
      if (params.minPrice) filter.price.$gte = parseInt(params.minPrice);
      if (params.maxPrice) filter.price.$lte = parseInt(params.maxPrice);
    }

    if (params.minYear || params.maxYear) {
      filter.year = {};
      if (params.minYear) filter.year.$gte = parseInt(params.minYear);
      if (params.maxYear) filter.year.$lte = parseInt(params.maxYear);
    }

    if (params.availability) {
      filter.availability = params.availability;
    }

    if (params.condition) {
      filter.condition = params.condition;
    }

    if (params.transmission) {
      const txList = params.transmission.split(",").map(s => s.trim()).filter(Boolean);
      if (txList.length > 0) {
        filter.transmission = { $in: txList };
      }
    }

    if (params.fuelType) {
      const ftList = params.fuelType.split(",").map(s => s.trim()).filter(Boolean);
      if (ftList.length > 0) {
        filter.fuelType = { $in: ftList };
      }
    }

    // Sort options
    let sortOption: Record<string, any> = { createdAt: -1 };
    switch (params.sort) {
      case "price_asc":
        sortOption = { price: 1 };
        break;
      case "price_desc":
        sortOption = { price: -1 };
        break;
      case "year_desc":
        sortOption = { year: -1 };
        break;
      case "year_asc":
        sortOption = { year: 1 };
        break;
      case "mileage_asc":
        sortOption = { mileage: 1 };
        break;
      default:
        sortOption = { createdAt: -1 };
    }

    const page = Math.max(1, parseInt(params.page || "1") || 1);
    const pageSize = params.pageSize || 12;
    const skip = (page - 1) * pageSize;

    const [totalCount, docs] = await Promise.all([
      ListingModel.countDocuments(filter),
      ListingModel.find(filter).sort(sortOption).skip(skip).limit(pageSize).lean(),
    ]);

    const totalPages = Math.ceil(totalCount / pageSize);
    const vehicles = docs.map(formatListing);

    return {
      vehicles,
      totalCount,
      currentPage: page,
      totalPages,
    };
  } catch (error) {
    console.error("Error querying published vehicles:", error);
    return {
      vehicles: [],
      totalCount: 0,
      currentPage: 1,
      totalPages: 0,
    };
  }
}

// Deprecated empty fallback array for legacy code
export const dummyVehicles: VehicleListing[] = [];
