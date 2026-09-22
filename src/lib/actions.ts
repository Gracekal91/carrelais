"use server";

import { cookies } from "next/headers";
import { revalidatePath } from "next/cache";
import bcrypt from "bcryptjs";
import { connectToDatabase } from "@/lib/mongodb";
import { UserModel } from "@/lib/models/User";
import { ListingModel } from "@/lib/models/Listing";
import { ReportModel } from "@/lib/models/Report";
import { AuditLogModel } from "@/lib/models/AuditLog";
import { getCurrentUser, requireAuth, requireAdminUser } from "@/lib/auth";
import { ensureSuperAdminInitialized } from "@/lib/db/init";
import { User, ExtendedVehicleListing } from "@/lib/db/schema";
import { VehicleStatus } from "@/types";

export async function login(email: string, password: string) {
  try {
    await connectToDatabase();
    await ensureSuperAdminInitialized();

    const normalizedEmail = email.toLowerCase().trim();
    const user = await UserModel.findOne({ email: normalizedEmail });

    if (!user) {
      return { success: false, error: "Identifiants invalides" };
    }

    if (user.status === "SUSPENDED") {
      return { 
        success: false, 
        error: "Votre compte a été suspendu par l'administration. Veuillez contacter le support." 
      };
    }

    const passwordMatch = await bcrypt.compare(password, user.password || "");
    if (!passwordMatch) {
      return { success: false, error: "Identifiants invalides" };
    }

    const cookieStore = await cookies();
    const sessionToken = user._id.toString();

    // Set secure session cookies
    cookieStore.set("cr_session", sessionToken, {
      path: "/",
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 30 * 24 * 60 * 60, // 30 days
    });

    cookieStore.set("mock_user_id", sessionToken, {
      path: "/",
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 30 * 24 * 60 * 60,
    });

    return { success: true, role: user.role };
  } catch (error: any) {
    console.error("[Login Error]", error);
    return { success: false, error: "Erreur lors de la connexion. Veuillez réessayer." };
  }
}

export async function logout() {
  const cookieStore = await cookies();
  cookieStore.delete("cr_session");
  cookieStore.delete("mock_user_id");
}

export async function getAuthUser() {
  const user = await getCurrentUser();
  return user ? { id: user.id, role: user.role, name: user.firstName } : null;
}

export async function signup(data: Partial<User> & { password?: string }) {
  try {
    await connectToDatabase();

    const normalizedEmail = (data.email || "").toLowerCase().trim();
    if (!normalizedEmail || !data.password) {
      return { success: false, error: "E-mail et mot de passe requis" };
    }

    const existing = await UserModel.findOne({ email: normalizedEmail });
    if (existing) {
      return { success: false, error: "Cet e-mail est déjà utilisé" };
    }

    const hashedPassword = await bcrypt.hash(data.password, 12);

    const newUser = await UserModel.create({
      email: normalizedEmail,
      password: hashedPassword,
      firstName: (data.firstName || "").trim(),
      lastName: (data.lastName || "").trim(),
      phone: (data.phone || "").trim(),
      role: "USER",
      accountType: data.accountType || "INDIVIDUAL",
      dealershipName: data.dealershipName?.trim() || undefined,
      location: data.location || "Kinshasa, RDC",
      joinedAt: new Date().toISOString(),
      status: "ACTIVE",
    });

    const cookieStore = await cookies();
    const sessionToken = newUser._id.toString();

    cookieStore.set("cr_session", sessionToken, {
      path: "/",
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 30 * 24 * 60 * 60,
    });

    cookieStore.set("mock_user_id", sessionToken, {
      path: "/",
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 30 * 24 * 60 * 60,
    });

    return { success: true };
  } catch (error: any) {
    console.error("[Signup Error]", error);
    return { success: false, error: error.message || "Erreur lors de l'inscription" };
  }
}

export async function createListing(data: Partial<ExtendedVehicleListing>) {
  try {
    const owner = await requireAuth();
    await connectToDatabase();

    const cleanMake = (data.make || "").trim();
    const cleanModel = (data.model || "").trim();
    const cleanCity = (data.city || "").trim();
    const cleanCommune = (data.commune || "").trim();
    const resolvedLocation = cleanCommune && cleanCity
      ? `${cleanCommune}, ${cleanCity}, RDC`
      : cleanCity
      ? `${cleanCity}, RDC`
      : (data.location || owner.location || "Kinshasa, RDC");

    const uniqueTimestamp = Date.now();
    const slug = `${cleanMake}-${cleanModel}-${data.year || new Date().getFullYear()}-${uniqueTimestamp}`
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/(^-|-$)+/g, "");

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

    const newListing = await ListingModel.create({
      ...data,
      slug,
      ownerId: owner.id,
      title: data.title || `${data.year} ${cleanMake} ${cleanModel}`,
      make: cleanMake,
      model: cleanModel,
      year: Number(data.year) || new Date().getFullYear(),
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
      images: (data.images && data.images.length > 0) ? data.images : [],
      views: 0,
      contacts: 0,
      chats: 0,
      phoneClicks: 0,
      dailyStats: [],
      status: "PENDING_REVIEW",
      isFeatured: false,
      isVerified: Boolean(owner.isVerified),
      currency: "USD",
      isNegotiable: Boolean(data.isNegotiable),
      financeAvailable: Boolean(data.financeAvailable),
      seller: {
        id: owner.id,
        name: owner.accountType === "DEALERSHIP" ? (owner.dealershipName || `${owner.firstName} ${owner.lastName}`) : `${owner.firstName} ${owner.lastName}`,
        type: owner.accountType,
        isVerified: Boolean(owner.isVerified),
        phone: owner.phone,
        whatsapp: owner.whatsapp || owner.phone,
        location: owner.location || resolvedLocation,
        joinedAt: owner.joinedAt,
      },
      approvalHistory: [
        {
          date: new Date().toISOString(),
          adminName: "Système",
          action: "SUBMITTED",
        }
      ],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    });

    revalidatePath("/dashboard");
    revalidatePath("/dashboard/listings");
    revalidatePath("/admin/listings");
    revalidatePath("/vehicles");

    return { success: true, id: newListing._id.toString(), slug };
  } catch (error: any) {
    console.error("[Create Listing Error]", error);
    return { success: false, error: error.message || "Erreur lors de la création de l'annonce" };
  }
}

export async function approveListingAction(listingId: string) {
  try {
    const admin = await requireAdminUser();
    await connectToDatabase();

    const listing = await ListingModel.findById(listingId);
    if (!listing) return { success: false, error: "Annonce introuvable" };

    listing.status = "PUBLISHED";
    listing.approvedAt = new Date().toISOString();
    listing.approvedBy = `${admin.firstName} ${admin.lastName}`;

    if (!listing.approvalHistory) listing.approvalHistory = [];
    listing.approvalHistory.push({
      date: new Date().toISOString(),
      adminName: `${admin.firstName} ${admin.lastName}`,
      action: "APPROVED",
    });

    await listing.save();

    await AuditLogModel.create({
      adminId: admin.id,
      adminName: `${admin.firstName} ${admin.lastName}`,
      action: "LISTING_APPROVED",
      targetType: "LISTING",
      targetId: listing._id.toString(),
      targetLabel: `${listing.year} ${listing.make} ${listing.model}`,
      details: "Annonce approuvée et mise en ligne sur le marketplace.",
      timestamp: new Date().toISOString(),
    });

    revalidatePath("/admin");
    revalidatePath("/admin/listings");
    revalidatePath(`/admin/listings/${listingId}`);
    revalidatePath("/dashboard");
    revalidatePath("/vehicles");
    return { success: true };
  } catch (error: any) {
    console.error("[Approve Listing Error]", error);
    return { success: false, error: error.message || "Erreur lors de l'approbation" };
  }
}

export async function rejectListingAction(listingId: string, reason: string, comment?: string) {
  try {
    const admin = await requireAdminUser();
    await connectToDatabase();

    const listing = await ListingModel.findById(listingId);
    if (!listing) return { success: false, error: "Annonce introuvable" };

    listing.status = "REJECTED";
    listing.rejectionReason = reason;
    listing.rejectionComment = comment?.trim() || undefined;

    if (!listing.approvalHistory) listing.approvalHistory = [];
    listing.approvalHistory.push({
      date: new Date().toISOString(),
      adminName: `${admin.firstName} ${admin.lastName}`,
      action: "REJECTED",
      reason,
      comment: comment?.trim() || undefined,
    });

    await listing.save();

    await AuditLogModel.create({
      adminId: admin.id,
      adminName: `${admin.firstName} ${admin.lastName}`,
      action: "LISTING_REJECTED",
      targetType: "LISTING",
      targetId: listing._id.toString(),
      targetLabel: `${listing.year} ${listing.make} ${listing.model}`,
      details: `Motif : ${reason}${comment ? ` (${comment})` : ""}`,
      timestamp: new Date().toISOString(),
    });

    revalidatePath("/admin");
    revalidatePath("/admin/listings");
    revalidatePath(`/admin/listings/${listingId}`);
    revalidatePath("/dashboard");
    revalidatePath("/vehicles");
    return { success: true };
  } catch (error: any) {
    console.error("[Reject Listing Error]", error);
    return { success: false, error: error.message || "Erreur lors du rejet" };
  }
}

export async function setListingStatusAction(listingId: string, status: VehicleStatus, note?: string) {
  try {
    const admin = await requireAdminUser();
    await connectToDatabase();

    const listing = await ListingModel.findById(listingId);
    if (!listing) return { success: false, error: "Annonce introuvable" };

    const previousStatus = listing.status;
    listing.status = status;

    let auditAction: any = "LISTING_UNPUBLISHED";
    if (status === "SUSPENDED") auditAction = "LISTING_SUSPENDED";
    else if (status === "PUBLISHED") auditAction = "LISTING_APPROVED";

    if (!listing.approvalHistory) listing.approvalHistory = [];
    listing.approvalHistory.push({
      date: new Date().toISOString(),
      adminName: `${admin.firstName} ${admin.lastName}`,
      action: status === "SUSPENDED" ? "SUSPENDED" : "REACTIVATED",
      reason: note || `Statut modifié de ${previousStatus} à ${status}`,
    });

    await listing.save();

    await AuditLogModel.create({
      adminId: admin.id,
      adminName: `${admin.firstName} ${admin.lastName}`,
      action: auditAction,
      targetType: "LISTING",
      targetId: listing._id.toString(),
      targetLabel: `${listing.year} ${listing.make} ${listing.model}`,
      details: note || `Statut modifié de ${previousStatus} à ${status}`,
      timestamp: new Date().toISOString(),
    });

    revalidatePath("/admin");
    revalidatePath("/admin/listings");
    revalidatePath(`/admin/listings/${listingId}`);
    revalidatePath("/dashboard");
    revalidatePath("/vehicles");
    return { success: true };
  } catch (error: any) {
    console.error("[Set Listing Status Error]", error);
    return { success: false, error: error.message || "Erreur lors du changement de statut" };
  }
}

export async function toggleUserStatusAction(userId: string, newStatus: "ACTIVE" | "SUSPENDED", reason?: string) {
  try {
    const admin = await requireAdminUser();
    await connectToDatabase();

    const user = await UserModel.findById(userId);
    if (!user) return { success: false, error: "Utilisateur introuvable" };

    user.status = newStatus;
    await user.save();

    if (newStatus === "SUSPENDED") {
      await ListingModel.updateMany(
        { ownerId: user._id.toString(), status: "PUBLISHED" },
        { $set: { status: "SUSPENDED" } }
      );
    }

    await AuditLogModel.create({
      adminId: admin.id,
      adminName: `${admin.firstName} ${admin.lastName}`,
      action: newStatus === "SUSPENDED" ? "USER_SUSPENDED" : "USER_REACTIVATED",
      targetType: "USER",
      targetId: user._id.toString(),
      targetLabel: user.accountType === "DEALERSHIP" ? (user.dealershipName || user.email) : `${user.firstName} ${user.lastName}`,
      details: reason || (newStatus === "SUSPENDED" ? "Compte suspendu par l'administration" : "Compte réactivé par l'administration"),
      timestamp: new Date().toISOString(),
    });

    revalidatePath("/admin");
    revalidatePath("/admin/users");
    revalidatePath("/admin/dealers");
    revalidatePath("/admin/listings");
    return { success: true };
  } catch (error: any) {
    console.error("[Toggle User Status Error]", error);
    return { success: false, error: error.message || "Erreur" };
  }
}

export async function toggleDealerVerificationAction(dealerId: string, isVerified: boolean, reason?: string) {
  try {
    const admin = await requireAdminUser();
    await connectToDatabase();

    const user = await UserModel.findById(dealerId);
    if (!user) return { success: false, error: "Concessionnaire introuvable" };

    user.isVerified = isVerified;
    await user.save();

    // Synchronize seller verification on all dealer listings
    await ListingModel.updateMany(
      { ownerId: user._id.toString() },
      { 
        $set: { 
          "seller.isVerified": isVerified, 
          isVerified: isVerified 
        } 
      }
    );

    await AuditLogModel.create({
      adminId: admin.id,
      adminName: `${admin.firstName} ${admin.lastName}`,
      action: isVerified ? "DEALER_VERIFIED" : "DEALER_UNVERIFIED",
      targetType: "DEALER",
      targetId: user._id.toString(),
      targetLabel: user.dealershipName || `${user.firstName} ${user.lastName}`,
      details: reason || (isVerified ? "Concessionnaire vérifié avec succès." : "Statut de vérification révoqué."),
      timestamp: new Date().toISOString(),
    });

    revalidatePath("/admin");
    revalidatePath("/admin/dealers");
    revalidatePath("/admin/users");
    revalidatePath(`/dealers/${dealerId}`);
    revalidatePath("/vehicles");
    return { success: true };
  } catch (error: any) {
    console.error("[Dealer Verification Error]", error);
    return { success: false, error: error.message || "Erreur lors de la mise à jour de la vérification" };
  }
}

export async function resolveReportAction(reportId: string, status: "RESOLVED" | "REJECTED", resolutionNote?: string) {
  try {
    const admin = await requireAdminUser();
    await connectToDatabase();

    const report = await ReportModel.findById(reportId);
    if (!report) return { success: false, error: "Signalement introuvable" };

    report.status = status;
    report.resolvedAt = new Date().toISOString();
    report.resolvedBy = `${admin.firstName} ${admin.lastName}`;
    report.resolutionNote = resolutionNote?.trim() || undefined;
    await report.save();

    await AuditLogModel.create({
      adminId: admin.id,
      adminName: `${admin.firstName} ${admin.lastName}`,
      action: status === "RESOLVED" ? "REPORT_RESOLVED" : "REPORT_REJECTED",
      targetType: "REPORT",
      targetId: report._id.toString(),
      targetLabel: report.targetTitle,
      details: resolutionNote || (status === "RESOLVED" ? "Signalement traité et résolu." : "Signalement classé sans suite."),
      timestamp: new Date().toISOString(),
    });

    revalidatePath("/admin");
    revalidatePath("/admin/reports");
    return { success: true };
  } catch (error: any) {
    console.error("[Resolve Report Error]", error);
    return { success: false, error: error.message || "Erreur" };
  }
}

export async function updateUserProfile(data: Partial<User>) {
  try {
    const user = await requireAuth();
    await connectToDatabase();

    const existing = await UserModel.findById(user.id);
    if (!existing) return { success: false, error: "Utilisateur introuvable" };

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

    await existing.save();

    // Propagate updated contact info across seller's listings
    await ListingModel.updateMany(
      { ownerId: existing._id.toString() },
      {
        $set: {
          "seller.name": existing.dealershipName || `${existing.firstName} ${existing.lastName}`,
          "seller.phone": existing.phone,
          "seller.whatsapp": existing.whatsapp || existing.phone,
          "seller.location": existing.location,
        }
      }
    );

    revalidatePath("/dashboard/profile");
    revalidatePath(`/dealers/${existing._id.toString()}`);
    revalidatePath("/vehicles");
    return { success: true };
  } catch (error: any) {
    console.error("[Update Profile Error]", error);
    return { success: false, error: error.message || "Erreur lors de la mise à jour du profil" };
  }
}

export async function incrementAnalytics(id: string, type: "views" | "chats" | "phoneClicks" | "contacts") {
  try {
    await connectToDatabase();
    const today = new Date().toISOString().split("T")[0];

    const listing = await ListingModel.findById(id);
    if (!listing) return;

    listing[type] = (listing[type] || 0) + 1;

    let stat = listing.dailyStats?.find(s => s.date === today);
    if (!stat) {
      if (!listing.dailyStats) listing.dailyStats = [];
      stat = { date: today, views: 0, contacts: 0 };
      listing.dailyStats.push(stat);
    }

    if (type === "views") stat.views++;
    else stat.contacts++;

    await listing.save();
  } catch (error) {
    // Non-blocking analytics error
    console.error("[Increment Analytics Error]", error);
  }
}

export async function updateListingStatus(id: string, status: VehicleStatus, reason?: string) {
  return setListingStatusAction(id, status, reason);
}

export async function getMatchingListingsCount(filters: {
  q?: string;
  make?: string;
  model?: string;
  province?: string;
  minPrice?: string;
  maxPrice?: string;
  minYear?: string;
  maxYear?: string;
}): Promise<number> {
  try {
    await connectToDatabase();
    const query: Record<string, any> = { status: "PUBLISHED" };

    if (filters.q) {
      const qRegex = new RegExp(filters.q.trim(), "i");
      query.$or = [
        { title: qRegex },
        { make: qRegex },
        { model: qRegex },
        { description: qRegex },
      ];
    }

    if (filters.make) {
      query.make = new RegExp(`^${filters.make.trim()}$`, "i");
    }

    if (filters.model) {
      query.model = new RegExp(filters.model.trim(), "i");
    }

    if (filters.province) {
      query.location = new RegExp(filters.province.trim(), "i");
    }

    if (filters.minPrice || filters.maxPrice) {
      query.price = {};
      if (filters.minPrice) query.price.$gte = parseInt(filters.minPrice);
      if (filters.maxPrice) query.price.$lte = parseInt(filters.maxPrice);
    }

    if (filters.minYear || filters.maxYear) {
      query.year = {};
      if (filters.minYear) query.year.$gte = parseInt(filters.minYear);
      if (filters.maxYear) query.year.$lte = parseInt(filters.maxYear);
    }

    return await ListingModel.countDocuments(query);
  } catch (error) {
    console.error("Error fetching matching listings count:", error);
    return 0;
  }
}

