import { db } from "@/lib/db";
import { notFound } from "next/navigation";
import DealerProfileView from "@/components/dashboard/DealerProfileView";
import { getCurrentUser } from "@/lib/auth";
import type { Metadata } from "next";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string; locale: string }>;
}): Promise<Metadata> {
  const { id } = await params;
  const user = db.users.find(u => u.id === id);

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
  const dealerUser = db.users.find(u => u.id === id);

  if (!dealerUser) {
    notFound();
  }

  const currentUser = await getCurrentUser();
  const isOwner = currentUser?.id === dealerUser.id;

  const activeListings = db.listings.filter(
    l => l.ownerId === dealerUser.id && l.status === "PUBLISHED"
  );
  const soldListings = db.listings.filter(
    l => l.ownerId === dealerUser.id && l.status === "SOLD"
  );

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
