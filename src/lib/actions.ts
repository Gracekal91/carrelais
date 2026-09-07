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
  const slug = `${data.make}-${data.model}-${data.year}-${id}`.toLowerCase().replace(/[^a-z0-9]+/g, "-");
  
  const newListing: ExtendedVehicleListing = {
    ...data,
    id,
    slug,
    ownerId,
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
      location: owner.location || data.location,
      joinedAt: owner.joinedAt,
    }
  } as ExtendedVehicleListing;
  
  db.listings.unshift(newListing);
  revalidatePath("/dashboard");
  revalidatePath("/admin/listings");
  
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
