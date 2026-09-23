import type { Metadata } from "next";
import { VehiclesPage } from "@/components/search/VehiclesPage";
import { getPublishedVehicles } from "@/lib/data";
import { getBaseUrl } from "@/lib/url";

export async function generateMetadata(props: {
  params: Promise<{ locale?: string }>;
  searchParams: Promise<{
    q?: string;
    make?: string;
    model?: string;
    availability?: string;
    condition?: string;
    page?: string;
  }>;
}): Promise<Metadata> {
  const [params, searchParams] = await Promise.all([props.params, props.searchParams]);
  const isEn = params.locale === "en";
  const baseUrl = getBaseUrl();

  let title = isEn
    ? "Cars for Sale in DRC — New & Used Vehicles | Car Relais"
    : "Voitures à vendre en RDC — Véhicules d'occasion & neufs | Car Relais";

  let description = isEn
    ? "Discover cars for sale in Kinshasa and across the DRC. Browse local inventory or import directly with verified sellers."
    : "Découvrez des centaines de voitures à vendre à Kinshasa et en RDC. Véhicules disponibles immédiatement au Congo ou prêts pour importation.";

  if (searchParams.make) {
    title = isEn
      ? `${searchParams.make} Cars for Sale in DRC | Car Relais`
      : `Voitures ${searchParams.make} à vendre en RDC | Car Relais`;
    description = isEn
      ? `Find verified new and used ${searchParams.make} vehicles for sale in Kinshasa and the DRC on Car Relais.`
      : `Trouvez votre voiture ${searchParams.make} neuve ou d'occasion à Kinshasa et en RDC sur Car Relais.`;
  } else if (searchParams.availability === "IN_CONGO") {
    title = isEn
      ? "Cars Available in Congo (Kinshasa) | Car Relais"
      : "Véhicules disponibles immédiatement au Congo (Kinshasa) | Car Relais";
    description = isEn
      ? "Browse vehicles already in the DRC ready to drive today. No import waiting time."
      : "Parcourez les voitures déjà présentes en RDC, prêtes à rouler immédiatement sans délai d'importation.";
  } else if (searchParams.availability === "IMPORT") {
    title = isEn
      ? "Cars for Import to DRC (Dubai, Europe, USA) | Car Relais"
      : "Voitures pour importation en RDC (Dubaï, Europe, USA) | Car Relais";
    description = isEn
      ? "Import quality vehicles directly to the Democratic Republic of Congo from Dubai, Europe and the USA."
      : "Importez en toute sécurité votre voiture de rêve depuis Dubaï, l'Europe ou les États-Unis vers la RDC.";
  } else if (searchParams.q) {
    title = isEn
      ? `Search results for "${searchParams.q}" | Car Relais`
      : `Résultats de recherche pour « ${searchParams.q} » | Car Relais`;
  }

  const queryParts: string[] = [];
  if (searchParams.availability) {
    queryParts.push(`availability=${encodeURIComponent(searchParams.availability)}`);
  }
  if (searchParams.make) {
    queryParts.push(`make=${encodeURIComponent(searchParams.make)}`);
  }
  const queryString = queryParts.length > 0 ? `?${queryParts.join("&")}` : "";
  const canonicalUrl = isEn ? `${baseUrl}/en/vehicles${queryString}` : `${baseUrl}/vehicles${queryString}`;

  return {
    title,
    description,
    alternates: {
      canonical: canonicalUrl,
      languages: {
        fr: `${baseUrl}/vehicles${queryString}`,
        en: `${baseUrl}/en/vehicles${queryString}`,
        "x-default": `${baseUrl}/vehicles${queryString}`,
      },
    },
    openGraph: {
      title,
      description,
      url: canonicalUrl,
      type: "website",
      locale: isEn ? "en_US" : "fr_FR",
      siteName: "Car Relais",
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
    },
  };
}

export default async function Page(props: {
  params: Promise<{ locale?: string }>;
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const [params, searchParams] = await Promise.all([props.params, props.searchParams]);
  const isEn = params.locale === "en";
  const baseUrl = getBaseUrl();

  const { vehicles, totalCount, currentPage, totalPages } = await getPublishedVehicles(searchParams);

  const queryParts: string[] = [];
  if (typeof searchParams.availability === "string" && searchParams.availability) {
    queryParts.push(`availability=${encodeURIComponent(searchParams.availability)}`);
  }
  if (typeof searchParams.make === "string" && searchParams.make) {
    queryParts.push(`make=${encodeURIComponent(searchParams.make)}`);
  }
  const queryString = queryParts.length > 0 ? `?${queryParts.join("&")}` : "";
  const canonicalUrl = isEn ? `${baseUrl}/en/vehicles${queryString}` : `${baseUrl}/vehicles${queryString}`;

  const jsonLdBreadcrumb = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      {
        "@type": "ListItem",
        position: 1,
        name: isEn ? "Home" : "Accueil",
        item: isEn ? `${baseUrl}/en` : `${baseUrl}`,
      },
      {
        "@type": "ListItem",
        position: 2,
        name: isEn ? "Vehicles" : "Véhicules",
        item: canonicalUrl,
      },
    ],
  };

  const jsonLdItemList = {
    "@context": "https://schema.org",
    "@type": "ItemList",
    name: isEn ? "Vehicles for Sale in DRC" : "Véhicules à vendre en RDC",
    numberOfItems: vehicles.length,
    itemListElement: vehicles.map((v, index) => ({
      "@type": "ListItem",
      position: index + 1,
      name: v.title,
      url: isEn ? `${baseUrl}/en/vehicles/${v.slug}` : `${baseUrl}/vehicles/${v.slug}`,
      image: v.images?.[0] || undefined,
    })),
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLdBreadcrumb) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLdItemList) }}
      />
      <VehiclesPage
        vehicles={vehicles}
        totalCount={totalCount}
        currentPage={currentPage}
        totalPages={totalPages}
      />
    </>
  );
}
