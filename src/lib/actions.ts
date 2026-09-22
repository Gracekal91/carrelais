"use server";

import { cookies } from "next/headers";
import { revalidatePath } from "next/cache";
import bcrypt from "bcryptjs";
import { connectToDatabase } from "@/lib/mongodb";
import { UserModel } from "@/lib/models/User";
import { ListingModel } from "@/lib/models/Listing";
import { ReportModel } from "@/lib/models/Report";
import { AuditLogModel } from "@/lib/models/AuditLog";
import { getCurrentUser, requireAuth, requireAdminUser, requireSuperAdminUser } from "@/lib/auth";
import { ensureSuperAdminInitialized } from "@/lib/db/init";
import { User, ExtendedVehicleListing } from "@/lib/db/schema";
import { VehicleStatus } from "@/types";
import {
  sendVerificationOtpEmail,
  sendPasswordResetOtpEmail,
  sendChangePasswordOtpEmail,
  sendListingApprovedEmail,
  sendListingDeclinedEmail,
} from "@/lib/email";

function generate6DigitOtp(): string {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

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

    // Email verification check (Super Admin and Admin bypass)
    const isSuperAdminOrAdmin = user.role === "SUPER_ADMIN" || user.role === "ADMIN";
    if (!user.isEmailVerified && !user.isVerified && !isSuperAdminOrAdmin) {
      return {
        success: false,
        unverified: true,
        email: user.email,
        error: "Veuillez vérifier votre adresse email pour vous connecter.",
      };
    }

    try {
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
    } catch {
      // Ignored when called outside request scope
    }

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
    const otp = generate6DigitOtp();
    const otpExpires = new Date(Date.now() + 15 * 60 * 1000); // 15 minutes

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
      isVerified: false,
      isEmailVerified: false,
      verificationOtp: otp,
      verificationOtpExpires: otpExpires,
    });

    // Ensure verificationOtp and isEmailVerified are saved in DB directly
    await UserModel.updateOne(
      { _id: newUser._id },
      {
        $set: {
          verificationOtp: otp,
          verificationOtpExpires: otpExpires,
          isEmailVerified: false,
          isVerified: false,
        },
      }
    );

    console.log("[Signup OTP Generated]", {
      email: normalizedEmail,
      otp,
      expires: otpExpires,
    });

    // Send verification email via Resend
    await sendVerificationOtpEmail(normalizedEmail, (data.firstName || "").trim(), otp);

    return {
      success: true,
      requireVerification: true,
      email: normalizedEmail,
    };
  } catch (error: any) {
    console.error("[Signup Error]", error);
    return { success: false, error: error.message || "Erreur lors de l'inscription" };
  }
}

export async function verifyEmailOtp(email: string, otp: string) {
  try {
    await connectToDatabase();
    const normalizedEmail = (email || "").toLowerCase().trim();
    const cleanOtp = (otp || "").replace(/\s+/g, "").trim();

    if (!normalizedEmail || !cleanOtp) {
      return { success: false, error: "Email et code OTP requis" };
    }

    const user = await UserModel.findOne({ email: normalizedEmail });
    if (!user) {
      return { success: false, error: "Utilisateur introuvable" };
    }

    if (user.isEmailVerified) {
      // User is already verified, proceed with setting cookies if in request scope
      try {
        const cookieStore = await cookies();
        const sessionToken = user._id.toString();
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
      } catch {
        // Ignored outside request scope
      }
      return { success: true, role: user.role };
    }

    const rawOtp = user.verificationOtp || (user as any)._doc?.verificationOtp;
    const storedOtp = rawOtp ? String(rawOtp).trim() : "";
    const rawExpires = user.verificationOtpExpires || (user as any)._doc?.verificationOtpExpires;

    console.log("[Verify OTP Debug]", {
      email: normalizedEmail,
      inputOtp: cleanOtp,
      storedOtp,
      hasExpired: rawExpires ? new Date(rawExpires) < new Date() : false,
    });

    const validOtps = storedOtp.split(",").map((c) => c.trim()).filter(Boolean);
    if (validOtps.length === 0 || !validOtps.includes(cleanOtp)) {
      return { success: false, error: "Code de vérification incorrect" };
    }

    if (rawExpires && new Date(rawExpires) < new Date()) {
      return {
        success: false,
        error: "Ce code a expiré. Veuillez cliquer sur Renvoyer pour obtenir un nouveau code.",
      };
    }

    // Success: activate user with updateOne for persistent storage
    await UserModel.updateOne(
      { _id: user._id },
      {
        $set: {
          isEmailVerified: true,
          isVerified: true,
        },
        $unset: {
          verificationOtp: "",
          verificationOtpExpires: "",
        },
      }
    );

    // Log the user in if in request scope
    try {
      const cookieStore = await cookies();
      const sessionToken = user._id.toString();
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
    } catch {
      // Ignored outside request scope
    }

    return { success: true, role: user.role };
  } catch (error: any) {
    console.error("[Verify Email OTP Error]", error);
    return { success: false, error: error.message || "Erreur de validation" };
  }
}

export async function resendVerificationOtp(email: string) {
  try {
    await connectToDatabase();
    const normalizedEmail = (email || "").toLowerCase().trim();

    const user = await UserModel.findOne({ email: normalizedEmail });
    if (!user) {
      return { success: false, error: "Aucun compte trouvé avec cette adresse email" };
    }

    if (user.isEmailVerified) {
      return { success: false, error: "Ce compte est déjà vérifié" };
    }

    const otp = generate6DigitOtp();
    const otpExpires = new Date(Date.now() + 15 * 60 * 1000);
    const existingOtp = (user.verificationOtp || (user as any)._doc?.verificationOtp || "").toString().trim();
    const combinedOtps = existingOtp
      ? `${otp},${existingOtp}`.split(",").filter(Boolean).slice(0, 3).join(",")
      : otp;

    await UserModel.updateOne(
      { _id: user._id },
      {
        $set: {
          verificationOtp: combinedOtps,
          verificationOtpExpires: otpExpires,
        },
      }
    );

    console.log("[Resend OTP Debug]", {
      email: normalizedEmail,
      otp,
      expires: otpExpires,
    });

    await sendVerificationOtpEmail(normalizedEmail, user.firstName, otp);
    return { success: true };
  } catch (error: any) {
    console.error("[Resend OTP Error]", error);
    return { success: false, error: error.message || "Erreur lors de l'envoi du code" };
  }
}

export async function requestPasswordReset(email: string) {
  try {
    await connectToDatabase();
    const normalizedEmail = (email || "").toLowerCase().trim();

    if (!normalizedEmail) {
      return { success: false, error: "Veuillez renseigner votre adresse email" };
    }

    const user = await UserModel.findOne({ email: normalizedEmail });
    if (!user) {
      return { success: false, error: "Aucun compte n'est associé à cette adresse email" };
    }

    const pin = generate6DigitOtp();
    const pinExpires = new Date(Date.now() + 15 * 60 * 1000);

    await UserModel.updateOne(
      { _id: user._id },
      {
        $set: {
          resetPasswordOtp: pin,
          resetPasswordOtpExpires: pinExpires,
        },
      }
    );

    console.log("[Password Reset PIN Debug]", {
      email: normalizedEmail,
      pin,
      expires: pinExpires,
    });

    await sendPasswordResetOtpEmail(normalizedEmail, user.firstName, pin);
    return { success: true };
  } catch (error: any) {
    console.error("[Request Password Reset Error]", error);
    return { success: false, error: error.message || "Erreur lors de la demande de réinitialisation" };
  }
}

export async function resetPasswordWithOtp(email: string, otp: string, newPassword: string) {
  try {
    await connectToDatabase();
    const normalizedEmail = (email || "").toLowerCase().trim();
    const cleanOtp = (otp || "").replace(/\s+/g, "").trim();

    if (!normalizedEmail || !cleanOtp || !newPassword) {
      return { success: false, error: "Tous les champs sont requis" };
    }

    if (newPassword.length < 6) {
      return { success: false, error: "Le mot de passe doit comporter au moins 6 caractères" };
    }

    const user = await UserModel.findOne({ email: normalizedEmail });
    if (!user) {
      return { success: false, error: "Utilisateur introuvable" };
    }

    const rawOtp = user.resetPasswordOtp || (user as any)._doc?.resetPasswordOtp;
    const storedOtp = rawOtp ? String(rawOtp).trim() : "";
    const rawExpires = user.resetPasswordOtpExpires || (user as any)._doc?.resetPasswordOtpExpires;

    if (!storedOtp || storedOtp !== cleanOtp) {
      return { success: false, error: "Code PIN de réinitialisation invalide" };
    }

    if (rawExpires && new Date(rawExpires) < new Date()) {
      return { success: false, error: "Le code PIN a expiré. Veuillez refaire une demande." };
    }

    const hashedPassword = await bcrypt.hash(newPassword, 12);
    await UserModel.updateOne(
      { _id: user._id },
      {
        $set: { password: hashedPassword },
        $unset: { resetPasswordOtp: "", resetPasswordOtpExpires: "" },
      }
    );

    return { success: true };
  } catch (error: any) {
    console.error("[Reset Password With OTP Error]", error);
    return { success: false, error: error.message || "Erreur lors du changement de mot de passe" };
  }
}

export async function requestChangePasswordOtp() {
  try {
    const authUser = await requireAuth();
    await connectToDatabase();

    const user = await UserModel.findById(authUser.id);
    if (!user) {
      return { success: false, error: "Utilisateur introuvable" };
    }

    const pin = generate6DigitOtp();
    const pinExpires = new Date(Date.now() + 15 * 60 * 1000);

    await UserModel.updateOne(
      { _id: user._id },
      {
        $set: {
          changePasswordOtp: pin,
          changePasswordOtpExpires: pinExpires,
        },
      }
    );

    console.log("[Change Password PIN Debug]", {
      email: user.email,
      pin,
      expires: pinExpires,
    });

    await sendChangePasswordOtpEmail(user.email, user.firstName, pin);
    return { success: true };
  } catch (error: any) {
    console.error("[Request Change Password OTP Error]", error);
    return { success: false, error: error.message || "Erreur lors de l'envoi du code PIN" };
  }
}

export async function changePasswordWithOtp(otp: string, currentPassword: string, newPassword: string) {
  try {
    const authUser = await requireAuth();
    await connectToDatabase();

    const cleanOtp = (otp || "").replace(/\s+/g, "").trim();
    if (!cleanOtp || !currentPassword || !newPassword) {
      return { success: false, error: "Tous les champs sont requis" };
    }

    if (newPassword.length < 6) {
      return { success: false, error: "Le nouveau mot de passe doit comporter au moins 6 caractères" };
    }

    const user = await UserModel.findById(authUser.id);
    if (!user) {
      return { success: false, error: "Utilisateur introuvable" };
    }

    const passwordMatch = await bcrypt.compare(currentPassword, user.password || "");
    if (!passwordMatch) {
      return { success: false, error: "Mot de passe actuel incorrect" };
    }

    const rawOtp = user.changePasswordOtp || (user as any)._doc?.changePasswordOtp;
    const storedOtp = rawOtp ? String(rawOtp).trim() : "";
    const rawExpires = user.changePasswordOtpExpires || (user as any)._doc?.changePasswordOtpExpires;

    if (!storedOtp || storedOtp !== cleanOtp) {
      return { success: false, error: "Code PIN de confirmation invalide" };
    }

    if (rawExpires && new Date(rawExpires) < new Date()) {
      return { success: false, error: "Le code PIN a expiré. Veuillez en redemander un nouveau." };
    }

    const hashedPassword = await bcrypt.hash(newPassword, 12);
    await UserModel.updateOne(
      { _id: user._id },
      {
        $set: { password: hashedPassword },
        $unset: { changePasswordOtp: "", changePasswordOtpExpires: "" },
      }
    );

    return { success: true };
  } catch (error: any) {
    console.error("[Change Password Error]", error);
    return { success: false, error: error.message || "Erreur lors du changement de mot de passe" };
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

    const isSuperAdminOrAdmin = owner.role === "SUPER_ADMIN" || owner.role === "ADMIN";
    const initialStatus = data.status === "DRAFT" ? "DRAFT" : (isSuperAdminOrAdmin ? "PUBLISHED" : "PENDING_REVIEW");

    const newListing = await ListingModel.create({
      ...data,
      slug,
      ownerId: owner.id,
      title: data.title || `${data.year} ${cleanMake} ${cleanModel}`,
      make: cleanMake,
      model: cleanModel,
      year: Number(data.year) || new Date().getFullYear(),
      price: Math.max(0, Number(data.price) || 0),
      mileage: (data.mileage !== undefined && data.mileage !== null && String(data.mileage).trim() !== "")
        ? Math.max(0, Number(data.mileage))
        : undefined,
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
      status: initialStatus,
      isFeatured: false,
      isVerified: Boolean(owner.isVerified),
      currency: "USD",
      isNegotiable: Boolean(data.isNegotiable),
      financeAvailable: Boolean(data.financeAvailable),
      source: data.source || undefined,
      sourceUrl: data.sourceUrl || undefined,
      contactOptions: data.contactOptions || undefined,
      seller: {
        id: owner.id,
        name: isSuperAdminOrAdmin ? "Car Relais" : (owner.accountType === "DEALERSHIP" ? (owner.dealershipName || `${owner.firstName} ${owner.lastName}`) : `${owner.firstName} ${owner.lastName}`),
        role: owner.role,
        type: owner.accountType,
        isVerified: Boolean(owner.isVerified || isSuperAdminOrAdmin),
        phone: owner.phone,
        whatsapp: owner.whatsapp || owner.phone,
        location: owner.location || resolvedLocation,
        joinedAt: owner.joinedAt,
      },
      approvalHistory: [
        {
          date: new Date().toISOString(),
          adminName: isSuperAdminOrAdmin ? `${owner.firstName} ${owner.lastName} (Admin)` : "Système",
          action: isSuperAdminOrAdmin ? "APPROVED" : "SUBMITTED",
          notes: isSuperAdminOrAdmin ? "Publication automatique (création par un administrateur)" : undefined,
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

    // Send confirmation email to seller
    if (listing.ownerId) {
      try {
        const owner = await UserModel.findById(listing.ownerId);
        if (owner?.email) {
          await sendListingApprovedEmail(
            owner.email,
            owner.firstName,
            `${listing.year} ${listing.make} ${listing.model}`,
            listing.slug
          );
        }
      } catch (emailErr) {
        console.error("[Email Notification Error - Listing Approved]", emailErr);
      }
    }

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

    // Send notification email to seller
    if (listing.ownerId) {
      try {
        const owner = await UserModel.findById(listing.ownerId);
        if (owner?.email) {
          await sendListingDeclinedEmail(
            owner.email,
            owner.firstName,
            `${listing.year} ${listing.make} ${listing.model}`,
            reason,
            comment?.trim()
          );
        }
      } catch (emailErr) {
        console.error("[Email Notification Error - Listing Declined]", emailErr);
      }
    }

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

export async function deleteUserAction(userId: string, reason?: string) {
  try {
    const superAdmin = await requireSuperAdminUser();
    await connectToDatabase();

    const user = await UserModel.findById(userId);
    if (!user) {
      return { success: false, error: "Utilisateur introuvable dans la base de données" };
    }

    if (user._id.toString() === superAdmin.id) {
      return {
        success: false,
        error: "Action impossible : vous ne pouvez pas supprimer votre propre compte Super Administrateur.",
      };
    }

    const targetLabel =
      user.accountType === "DEALERSHIP"
        ? user.dealershipName || user.email
        : `${user.firstName} ${user.lastName}`;

    // 1. Delete all vehicle listings owned by this user
    const listingDeleteResult = await ListingModel.deleteMany({ ownerId: user._id.toString() });

    // 2. Delete any reports associated with this user or their listings
    await ReportModel.deleteMany({
      $or: [{ targetId: user._id.toString() }, { reporterId: user._id.toString() }],
    });

    // 3. Delete user document permanently from the MongoDB database
    await UserModel.deleteOne({ _id: user._id });

    // 4. Record audit log entry
    await AuditLogModel.create({
      adminId: superAdmin.id,
      adminName: `${superAdmin.firstName} ${superAdmin.lastName}`,
      action: "USER_DELETED",
      targetType: "USER",
      targetId: user._id.toString(),
      targetLabel,
      details: `Compte et ${listingDeleteResult.deletedCount} annonce(s) définitivement supprimés de la base de données par le Super Admin ${superAdmin.firstName} ${superAdmin.lastName}.${reason ? ` Motif : ${reason}` : ""}`,
      timestamp: new Date().toISOString(),
    });

    console.log(
      `[Delete User] User ${user.email} (${user._id}) permanently deleted from DB by Super Admin ${superAdmin.email}. Deleted listings: ${listingDeleteResult.deletedCount}`
    );

    revalidatePath("/admin");
    revalidatePath("/admin/users");
    revalidatePath("/admin/dealers");
    revalidatePath("/admin/listings");
    revalidatePath("/vehicles");

    return {
      success: true,
      deletedListingsCount: listingDeleteResult.deletedCount,
      message: `L'utilisateur ${targetLabel} a été définitivement supprimé de la base de données.`,
    };
  } catch (error: any) {
    console.error("[Delete User Error]", error);
    return { success: false, error: error.message || "Erreur lors de la suppression de l'utilisateur" };
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

