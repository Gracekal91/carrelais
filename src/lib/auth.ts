import { cookies } from "next/headers";
import { connectToDatabase } from "@/lib/mongodb";
import { UserModel, IUser } from "@/lib/models/User";
import { User } from "@/lib/db/schema";

export async function getCurrentUser(): Promise<User | null> {
  const cookieStore = await cookies();
  const userId = cookieStore.get("cr_session")?.value || cookieStore.get("mock_user_id")?.value;

  if (!userId) return null;

  try {
    await connectToDatabase();
    let userDoc: IUser | null = null;

    // Check if valid ObjectId or string id
    if (/^[0-9a-fA-F]{24}$/.test(userId)) {
      userDoc = await UserModel.findById(userId);
    } else {
      userDoc = await UserModel.findOne({ email: userId.toLowerCase().trim() });
    }

    if (!userDoc) return null;

    // Convert to plain serializable User object
    return {
      id: userDoc._id.toString(),
      email: userDoc.email,
      firstName: userDoc.firstName,
      lastName: userDoc.lastName,
      phone: userDoc.phone,
      role: userDoc.role,
      accountType: userDoc.accountType,
      status: userDoc.status,
      dealershipName: userDoc.dealershipName,
      location: userDoc.location,
      city: userDoc.city,
      commune: userDoc.commune,
      address: userDoc.address,
      description: userDoc.description,
      logo: userDoc.logo,
      isVerified: Boolean(userDoc.isVerified),
      whatsapp: userDoc.whatsapp,
      foundedYear: userDoc.foundedYear,
      businessHours: userDoc.businessHours,
      website: userDoc.website,
      facebook: userDoc.facebook,
      instagram: userDoc.instagram,
      tiktok: userDoc.tiktok,
      joinedAt: userDoc.joinedAt || userDoc.createdAt.toISOString(),
    };
  } catch (err) {
    console.error("[getCurrentUser Error]", err);
    return null;
  }
}

export async function requireAuth(): Promise<User> {
  const user = await getCurrentUser();
  if (!user) {
    throw new Error("Authentification requise");
  }
  if (user.status === "SUSPENDED") {
    throw new Error("Votre compte est actuellement suspendu. Veuillez contacter l'administration.");
  }
  return user;
}

export async function requireAdminUser(): Promise<User> {
  const user = await requireAuth();
  if (user.role !== "SUPER_ADMIN" && user.role !== "ADMIN") {
    throw new Error("Accès non autorisé : droits administrateur requis");
  }
  return user;
}
