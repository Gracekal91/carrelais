import { notFound } from "next/navigation";
import DealerProfileView from "@/components/dashboard/DealerProfileView";
import { getCurrentUser } from "@/lib/auth";
import { connectToDatabase } from "@/lib/mongodb";
import { UserModel } from "@/lib/models/User";
import { ListingModel } from "@/lib/models/Listing";
import { formatListing } from "@/lib/data";
import type { Metadata } from "next";
import mongoose from "mongoose";

async function getDealerUser(id: string) {
  try {
    await connectToDatabase();
    const query = mongoose.Types.ObjectId.isValid(id) ? { _id: id } : { id };
    const user = await UserModel.findOne(query).lean();
    if (!user) return null;
    return {
      ...user,
      id: user._id.toString(),
      _id: undefined,
    } as any;
  } catch (err) {
    console.error("Error fetching dealer:", err);
    return null;
  }
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string; locale: string }>;
}): Promise<Metadata> {
  const { id } = await params;
  const user = await getDealerUser(id);

  if (!user) {
    return {
      title: "Concessionnaire introuvable | Car Relais",
    };
  }

  const name = user.dealershipName || `${user.firstName} ${user.lastName}`;
  const city = user.city || user.location || "RDC";

  return {
    title: `${name} — Véhicules à vendre à ${city} | Car Relais`,
    description: user.description || `Découvrez le catalogue de voitures neuves et d'occasion chez ${name} à ${city}, RDC.`,
  };
}

export default async function PublicDealerPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const dealerUser = await getDealerUser(id);

  if (!dealerUser) {
    notFound();
  }

  const currentUser = await getCurrentUser();
  const isOwner = currentUser?.id === dealerUser.id;

  const [activeDocs, soldDocs] = await Promise.all([
    ListingModel.find({ ownerId: dealerUser.id, status: "PUBLISHED" }).sort({ createdAt: -1 }).lean(),
    ListingModel.find({ ownerId: dealerUser.id, status: "SOLD" }).sort({ createdAt: -1 }).lean(),
  ]);

  const activeListings = activeDocs.map(formatListing);
  const soldListings = soldDocs.map(formatListing);

  return (
    <div className="container mx-auto px-4 py-8 max-w-6xl">
      <DealerProfileView
        user={dealerUser}
        activeListings={activeListings}
        soldListings={soldListings}
        isOwner={isOwner}
      />
    </div>
  );
}
