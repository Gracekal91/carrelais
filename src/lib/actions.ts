"use server";

import { cookies } from "next/headers";
import { db } from "./db";
import { User, ExtendedVehicleListing } from "./db/schema";
import { revalidatePath } from "next/cache";

export async function login(email: string, password: string) {
  const user = db.users.find(u => u.email === email && u.password === password);
  if (!user) {
    return { success: false, error: "Invalid credentials" };
  }
  
  const cookieStore = await cookies();
  cookieStore.set("mock_user_id", user.id, { path: "/" });
  return { success: true, role: user.role };
}

export async function logout() {
  const cookieStore = await cookies();
  cookieStore.delete("mock_user_id");
}

export async function getAuthUser() {
  const cookieStore = await cookies();
  const userId = cookieStore.get("mock_user_id")?.value;
  if (!userId) return null;
  const user = db.users.find(u => u.id === userId);
  return user ? { id: user.id, role: user.role, name: user.firstName } : null;
}

export async function signup(data: Partial<User>) {
  if (db.users.find(u => u.email === data.email)) {
    return { success: false, error: "Email already in use" };
  }
  
  const newUser: User = {
    id: `user_${Date.now()}`,
    email: data.email!,
    password: data.password!,
    firstName: data.firstName!,
    lastName: data.lastName!,
    phone: data.phone!,
    role: "USER",
    accountType: data.accountType || "INDIVIDUAL",
    dealershipName: data.dealershipName,
    location: data.location,
    joinedAt: new Date().toISOString(),
  };
  
  db.users.push(newUser);
  
  const cookieStore = await cookies();
  cookieStore.set("mock_user_id", newUser.id, { path: "/" });
  
  return { success: true };
}

import { getCurrentUser } from "./auth";

export async function createListing(data: Partial<ExtendedVehicleListing>) {
  const owner = await getCurrentUser();
  if (!owner) throw new Error("Unauthorized");
  const ownerId = owner.id;
  
  const id = `listing_${Date.now()}`;
  const cleanMake = (data.make || "").trim();
  const cleanModel = (data.model || "").trim();
  const cleanCity = (data.city || "").trim();
  const cleanCommune = (data.commune || "").trim();
  const resolvedLocation = cleanCommune && cleanCity
    ? `${cleanCommune}, ${cleanCity}, RDC`
    : cleanCity
    ? `${cleanCity}, RDC`
    : (data.location || owner.location || "Kinshasa, RDC");

  const slug = `${cleanMake}-${cleanModel}-${data.year}-${id}`.toLowerCase().replace(/[^a-z0-9]+/g, "-");
  
  // Body type mapping fallback
  const bodyTypeMap: Record<string, any> = {
    "Berline": "Sedan",
    "SUV": "SUV",
    "4x4": "SUV",
    "Pick-up": "Pickup",
    "Coupé": "Coupe",
    "Cabriolet": "Convertible",
    "Break": "Wagon",
    "Monospace": "Van",
    "Minibus": "Van",
    "Bus": "Van",
    "Camionnette": "Van",
  };
  const resolvedBodyType = (data.vehicleType && bodyTypeMap[data.vehicleType]) || data.bodyType || "SUV";

  const newListing: ExtendedVehicleListing = {
    ...data,
    id,
    slug,
    ownerId,
    title: data.title || `${data.year} ${cleanMake} ${cleanModel}`,
    make: cleanMake,
    model: cleanModel,
    price: Math.max(0, Number(data.price) || 0),
    mileage: Math.max(0, Number(data.mileage) || 0),
    doors: data.doors ? Math.max(1, Number(data.doors)) : 4,
    seats: data.seats ? Math.max(1, Number(data.seats)) : 5,
    horsepower: data.horsepower ? Math.max(0, Number(data.horsepower)) : undefined,
    bodyType: resolvedBodyType,
    availability: data.isImported ? "IMPORT" : (data.availability || "IN_CONGO"),
    listingAvailability: data.listingAvailability || "AVAILABLE",
    location: resolvedLocation,
    city: cleanCity,
    commune: cleanCommune,
    images: (data.images && data.images.length > 0)
      ? data.images
      : ["https://images.unsplash.com/photo-1542362567-b07e54358753?auto=format&fit=crop&w=800&q=80"],
    views: 0,
    contacts: 0,
    chats: 0,
    phoneClicks: 0,
    dailyStats: [],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    status: "PENDING_REVIEW",
    isFeatured: false,
    isVerified: owner.accountType === "DEALERSHIP",
    currency: "USD",
    seller: {
      id: owner.id,
      name: owner.accountType === "DEALERSHIP" ? owner.dealershipName! : `${owner.firstName} ${owner.lastName}`,
      type: owner.accountType,
      isVerified: true,
      phone: owner.phone,
      whatsapp: owner.phone,
      location: owner.location || resolvedLocation,
      joinedAt: owner.joinedAt,
    }
  } as ExtendedVehicleListing;
  
  db.listings.unshift(newListing);
  revalidatePath("/dashboard");
  revalidatePath("/admin/listings");
  revalidatePath("/vehicles");
  
  return { success: true, id };
}

export async function updateListingStatus(id: string, status: ExtendedVehicleListing["status"], reason?: string) {
  const listing = db.listings.find(l => l.id === id);
  if (!listing) return { success: false };
  
  listing.status = status;
  if (reason) listing.rejectionReason = reason;
  
  revalidatePath("/admin/listings");
  revalidatePath("/dashboard");
  revalidatePath("/vehicles");
  return { success: true };
}

export async function incrementAnalytics(id: string, type: "views" | "chats" | "phoneClicks" | "contacts") {
  const listing = db.listings.find(l => l.id === id);
  if (!listing) return;
  
  listing[type]++;
  
  // also update today's stat
  const today = new Date().toISOString().split("T")[0];
  let stat = listing.dailyStats.find(s => s.date === today);
  if (!stat) {
    stat = { date: today, views: 0, contacts: 0 };
    listing.dailyStats.push(stat);
  }
  
  if (type === "views") stat.views++;
  else stat.contacts++;
}

export async function updateUserProfile(data: Partial<User>) {
  const user = await getCurrentUser();
  if (!user) throw new Error("Unauthorized");

  const existing = db.users.find(u => u.id === user.id);
  if (!existing) return { success: false, error: "User not found" };

  if (data.dealershipName !== undefined) existing.dealershipName = data.dealershipName.trim();
  if (data.firstName !== undefined) existing.firstName = data.firstName.trim();
  if (data.lastName !== undefined) existing.lastName = data.lastName.trim();
  if (data.phone !== undefined) existing.phone = data.phone.trim();
  if (data.whatsapp !== undefined) existing.whatsapp = data.whatsapp.trim();
  if (data.description !== undefined) existing.description = data.description.trim();
  if (data.logo !== undefined) existing.logo = data.logo.trim();
  if (data.city !== undefined) existing.city = data.city.trim();
  if (data.commune !== undefined) existing.commune = data.commune.trim();
  if (data.address !== undefined) existing.address = data.address.trim();
  if (data.foundedYear !== undefined) existing.foundedYear = Number(data.foundedYear) || undefined;
  if (data.businessHours !== undefined) existing.businessHours = data.businessHours;
  if (data.website !== undefined) existing.website = data.website.trim();
  if (data.facebook !== undefined) existing.facebook = data.facebook.trim();
  if (data.instagram !== undefined) existing.instagram = data.instagram.trim();
  if (data.tiktok !== undefined) existing.tiktok = data.tiktok.trim();

  if (existing.commune && existing.city) {
    existing.location = `${existing.commune}, ${existing.city}, RDC`;
  } else if (existing.city) {
    existing.location = `${existing.city}, RDC`;
  }

  // Update seller references across listings
  db.listings.forEach(l => {
    if (l.ownerId === existing.id && l.seller) {
      if (existing.dealershipName) l.seller.name = existing.dealershipName;
      if (existing.phone) l.seller.phone = existing.phone;
      if (existing.whatsapp) l.seller.whatsapp = existing.whatsapp;
      if (existing.location) l.seller.location = existing.location;
    }
  });

  revalidatePath("/dashboard/profile");
  revalidatePath(`/dealers/${existing.id}`);
  revalidatePath("/vehicles");
  return { success: true };
}
