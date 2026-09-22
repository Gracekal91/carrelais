import { notFound } from "next/navigation";
import DealerProfileView from "@/components/dashboard/DealerProfileView";
import { getCurrentUser } from "@/lib/auth";
import { connectToDatabase } from "@/lib/mongodb";
import { UserModel } from "@/lib/models/User";
import { ListingModel } from "@/lib/models/Listing";
import { formatListing } from "@/lib/data";
import type { Metadata } from "next";
import mongoose from "mongoose";
import type { User } from "@/lib/db/schema";

async function getDealerUser(idOrSlug: string): Promise<User | null> {
  await connectToDatabase();
  try {
    const isValidObjectId = mongoose.Types.ObjectId.isValid(idOrSlug);
    const query = isValidObjectId ? { _id: idOrSlug } : { dealershipSlug: idOrSlug };
    const user = await UserModel.findOne(query).lean();
    if (!user) return null;
    return {
      ...user,
      id: user._id.toString(),
      _id: undefined,
    } as unknown as User;
  } catch (err) {
    console.error("Error fetching dealer:", err);
    return null;
  }
}

const BASE_URL =
  process.env.NEXT_PUBLIC_APP_URL && !process.env.NEXT_PUBLIC_APP_URL.includes("localhost")
    ? process.env.NEXT_PUBLIC_APP_URL
    : "https://carrelais.cd";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string; locale: string }>;
}): Promise<Metadata> {
  const { id, locale } = await params;
  const isEn = locale === "en";
  const user = await getDealerUser(id);

  if (!user) {
    return {
      title: isEn ? "Dealership Not Found | Car Relais" : "Concessionnaire introuvable | Car Relais",
      robots: { index: false, follow: false },
    };
  }

  const name = user.dealershipName || `${user.firstName} ${user.lastName}`;
  const city = user.city || user.location || (isEn ? "DRC" : "RDC");

  const title = isEn
    ? `${name} — Verified Car Dealership in ${city} | Car Relais`
    : `${name} — Véhicules à vendre à ${city} | Car Relais`;

  const description =
    user.description ||
    (isEn
      ? `Discover new and used vehicles for sale at ${name} in ${city}, DRC.`
      : `Découvrez le catalogue de voitures neuves et d'occasion chez ${name} à ${city}, RDC.`);

  const canonicalUrl = isEn ? `${BASE_URL}/en/dealers/${id}` : `${BASE_URL}/dealers/${id}`;

  return {
    title,
    description,
    alternates: {
      canonical: canonicalUrl,
      languages: {
        fr: `${BASE_URL}/dealers/${id}`,
        en: `${BASE_URL}/en/dealers/${id}`,
        "x-default": `${BASE_URL}/dealers/${id}`,
      },
    },
    openGraph: {
      title,
      description,
      url: canonicalUrl,
      type: "profile",
      locale: isEn ? "en_US" : "fr_FR",
      siteName: "Car Relais",
      images: user.logo ? [{ url: user.logo, alt: name }] : undefined,
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: user.logo ? [user.logo] : undefined,
    },
  };
}

export default async function PublicDealerPage({
  params,
}: {
  params: Promise<{ id: string; locale?: string }>;
}) {
  const { id, locale } = await params;
  const isEn = locale === "en";
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

  const name = dealerUser.dealershipName || `${dealerUser.firstName} ${dealerUser.lastName}`;
  const city = dealerUser.city || dealerUser.location || "Kinshasa";
  const canonicalUrl = isEn ? `${BASE_URL}/en/dealers/${id}` : `${BASE_URL}/dealers/${id}`;

  const jsonLdDealer = {
    "@context": "https://schema.org",
    "@type": "AutoDealer",
    name,
    description:
      dealerUser.description ||
      `Concessionnaire automobile vérifié sur Car Relais à ${city}.`,
    url: canonicalUrl,
    image: dealerUser.logo || undefined,
    telephone: dealerUser.phone || undefined,
    address: {
      "@type": "PostalAddress",
      addressLocality: city,
      addressCountry: "CD",
    },
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLdDealer) }}
      />
      <div className="container mx-auto px-4 py-8 max-w-6xl">
        <DealerProfileView
          user={dealerUser}
          activeListings={activeListings}
          soldListings={soldListings}
          isOwner={isOwner}
        />
      </div>
    </>
  );
}
