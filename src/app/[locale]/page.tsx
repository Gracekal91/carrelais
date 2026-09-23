import Image from "next/image";
import { AdvancedSearchWidget } from "@/components/search/AdvancedSearchWidget";
import { VehicleGrid } from "@/components/vehicles/VehicleGrid";
import { getFeaturedVehicles, getLocalVehicles } from "@/lib/data";
import { connectToDatabase } from "@/lib/mongodb";
import { ListingModel } from "@/lib/models/Listing";
import { Button } from "@/components/ui/Button";
import { Link } from "@/i18n/routing";
import { ArrowRight, ShieldCheck, Globe2, Clock } from "lucide-react";
import { getTranslations } from "next-intl/server";
import { getBaseUrl } from "@/lib/url";

import type { Metadata } from "next";

export async function generateMetadata(props: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await props.params;
  const isEn = locale === "en";
  const baseUrl = getBaseUrl();

  const title = isEn
    ? "Car Relais — #1 Automotive Marketplace in DRC | Cars for Sale in Kinshasa"
    : "Car Relais — #1 Marché Automobile en RDC | Voitures d'occasion & neuves à Kinshasa";

  const description = isEn
    ? "Browse verified new and used cars in the Democratic Republic of Congo. Vehicles available in Kinshasa and Lubumbashi, or ready for import from Dubai and Europe."
    : "Achetez et vendez des voitures neuves et d'occasion en République Démocratique du Congo. Véhicules disponibles à Kinshasa et Lubumbashi ou prêts pour importation.";

  const canonicalUrl = isEn ? `${baseUrl}/en` : baseUrl;

  return {
    title,
    description,
    alternates: {
      canonical: canonicalUrl,
      languages: {
        fr: baseUrl,
        en: `${baseUrl}/en`,
      },
    },
    openGraph: {
      title,
      description,
      url: canonicalUrl,
      type: "website",
      locale: isEn ? "en_US" : "fr_FR",
    },
  };
}

export default async function Home(props: { params: Promise<{ locale: string }> }) {
  const { locale } = await props.params;
  const isEn = locale === "en";

  await connectToDatabase();
  const [featuredVehicles, localVehicles, totalPublishedCount, tHome, tFeatures, tHero] = await Promise.all([
    getFeaturedVehicles(4),
    getLocalVehicles(4),
    ListingModel.countDocuments({ status: "PUBLISHED" }),
    getTranslations("Home"),
    getTranslations("Features"),
    getTranslations("Hero"),
  ]);

  const baseUrl = getBaseUrl();

  const jsonLdWebsite = {
    "@context": "https://schema.org",
    "@type": "WebSite",
    name: "Car Relais",
    url: isEn ? `${baseUrl}/en` : baseUrl,
    potentialAction: {
      "@type": "SearchAction",
      target: {
        "@type": "EntryPoint",
        urlTemplate: `${baseUrl}/vehicles?q={search_term_string}`,
      },
      "query-input": "required name=search_term_string",
    },
  };

  const jsonLdOrganization = {
    "@context": "https://schema.org",
    "@type": "AutoMarketplace",
    name: "Car Relais",
    url: baseUrl,
    logo: `${baseUrl}/icon.png`,
    description: isEn
      ? "The premier automotive marketplace in the Democratic Republic of Congo."
      : "Le premier marché automobile en République Démocratique du Congo.",
    areaServed: {
      "@type": "Country",
      name: "Democratic Republic of the Congo",
    },
    address: {
      "@type": "PostalAddress",
      addressLocality: "Kinshasa",
      addressCountry: "CD",
    },
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLdWebsite) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLdOrganization) }}
      />
      <div className="flex flex-col min-h-screen">
      {/* Hero Section */}
      <section className="relative h-auto md:h-[60vh] min-h-[460px] md:min-h-[550px] flex items-center overflow-hidden">
        {/* Background car image optimized with Next.js Image for immediate LCP preloading & downscaling */}
        <Image
          src="https://images.unsplash.com/photo-1492144534655-ae79c964c9d7?auto=format&fit=crop&w=1920&q=80"
          alt="Car Relais — Marché Automobile en RDC"
          fill
          priority
          sizes="100vw"
          className="object-cover object-center pointer-events-none"
        />
        {/* Layered overlay: dark left-to-right gradient + subtle vignette */}
        <div className="absolute inset-0 bg-gradient-to-r from-zinc-950/95 via-zinc-900/80 to-zinc-950/30" />
        <div className="absolute inset-0 bg-gradient-to-t from-zinc-950/60 via-transparent to-transparent" />

        {/* Content — left-aligned within container */}
        <div className="relative z-10 container mx-auto px-4 flex flex-col items-start justify-center h-full py-6 sm:py-10 md:py-10">
          <p className="text-primary font-semibold tracking-widest text-xs md:text-base uppercase mb-2 md:mb-3">
            {tHero("marketplace")}
          </p>

          {/* Widget capped at ~70% max width, left-aligned */}
          <div className="w-full max-w-2xl mb-4 md:mb-12">
            <AdvancedSearchWidget initialCount={totalPublishedCount} />
          </div>
        </div>
      </section>

      {/* Featured Vehicles — Completely hidden when empty */}
      {featuredVehicles && featuredVehicles.length > 0 && (
        <section className="py-8 md:py-16 border-b border-zinc-200 dark:border-zinc-800">
          <div className="container mx-auto px-4">
            <div className="flex justify-between items-end mb-5 md:mb-8">
              <div>
                <h2 className="text-xl md:text-3xl font-bold mb-1 md:mb-2">{tHome("featuredTitle")}</h2>
                <p className="text-xs md:text-sm text-zinc-500">{tHome("featuredDesc")}</p>
              </div>
              <Link href="/vehicles">
                <Button variant="ghost" className="hidden sm:flex gap-2">
                  {tHome("viewAll")} <ArrowRight className="w-4 h-4" />
                </Button>
              </Link>
            </div>
            <VehicleGrid vehicles={featuredVehicles.slice(0, 4)} />
            <div className="mt-5 sm:hidden">
              <Link href="/vehicles" className="w-full block">
                <Button variant="outline" className="w-full h-11 font-medium">{tHome("viewAllVehicles")}</Button>
              </Link>
            </div>
          </div>
        </section>
      )}

      {/* Features Section */}
      <section className="py-8 md:py-14 bg-white dark:bg-zinc-900 border-b border-zinc-200 dark:border-zinc-800">
        <div className="container mx-auto px-4 grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-8">
          <div className="flex flex-col items-center text-center p-2">
            <div className="w-12 h-12 bg-primary/10 text-primary rounded-xl flex items-center justify-center mb-3">
              <Globe2 className="w-6 h-6" />
            </div>
            <h3 className="text-base md:text-lg font-semibold mb-1.5">{tFeatures("localImportTitle")}</h3>
            <p className="text-xs md:text-sm text-zinc-500 leading-relaxed max-w-sm">{tFeatures("localImportDesc")}</p>
          </div>
          <div className="flex flex-col items-center text-center p-2">
            <div className="w-12 h-12 bg-primary/10 text-primary rounded-xl flex items-center justify-center mb-3">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <h3 className="text-base md:text-lg font-semibold mb-1.5">{tFeatures("verifiedSellersTitle")}</h3>
            <p className="text-xs md:text-sm text-zinc-500 leading-relaxed max-w-sm">{tFeatures("verifiedSellersDesc")}</p>
          </div>
          <div className="flex flex-col items-center text-center p-2">
            <div className="w-12 h-12 bg-primary/10 text-primary rounded-xl flex items-center justify-center mb-3">
              <Clock className="w-6 h-6" />
            </div>
            <h3 className="text-base md:text-lg font-semibold mb-1.5">{tFeatures("fastSearchTitle")}</h3>
            <p className="text-xs md:text-sm text-zinc-500 leading-relaxed max-w-sm">{tFeatures("fastSearchDesc")}</p>
          </div>
        </div>
      </section>

      {/* Local Vehicles — Completely hidden when empty */}
      {localVehicles && localVehicles.length > 0 && (
        <section className="py-8 md:py-16 bg-zinc-50 dark:bg-zinc-950/50">
          <div className="container mx-auto px-4">
            <div className="flex justify-between items-end mb-5 md:mb-8">
              <div>
                <h2 className="text-xl md:text-3xl font-bold mb-1 md:mb-2">{tHome("availableCongoTitle")}</h2>
                <p className="text-xs md:text-sm text-zinc-500">{tHome("availableCongoDesc")}</p>
              </div>
              <Link href="/vehicles?availability=IN_CONGO">
                <Button variant="ghost" className="hidden sm:flex gap-2">
                  {tHome("viewLocalInventory")} <ArrowRight className="w-4 h-4" />
                </Button>
              </Link>
            </div>
            <VehicleGrid vehicles={localVehicles} />
          </div>
        </section>
      )}
      </div>
    </>
  );
}
