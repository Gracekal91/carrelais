import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getVehicleBySlug } from "@/lib/data";
import { formatPrice, formatListingDate } from "@/lib/utils";
import {
  MapPin, CheckCircle2,
  Settings, Fuel, Calendar, Gauge, Car, ShieldAlert,
  Check, Clock, Palette, Tag, ShieldCheck, Sparkles
} from "lucide-react";
import { Link } from "@/i18n/routing";
import { VehicleGallery } from "@/components/vehicles/VehicleGallery";
import { VehicleViewTracker, VehicleContactButtons } from "@/components/vehicles/VehicleAnalyticsTracker";
import { getTranslations } from "next-intl/server";
import { getCurrentUser } from "@/lib/auth";
import { connectToDatabase } from "@/lib/mongodb";
import { UserModel } from "@/lib/models/User";
import { getBaseUrl } from "@/lib/url";

export async function generateMetadata(props: {
  params: Promise<{ slug: string; locale?: string }>;
}): Promise<Metadata> {
  const { slug, locale } = await props.params;
  const isEn = locale === "en";
  const baseUrl = getBaseUrl();

  const vehicle = await getVehicleBySlug(slug);

  if (!vehicle || vehicle.status !== "PUBLISHED") {
    return {
      title: isEn ? "Vehicle Not Found | Car Relais" : "Véhicule introuvable | Car Relais",
      robots: { index: false, follow: false },
    };
  }

  const locationText = vehicle.city || vehicle.location || (isEn ? "DRC" : "RDC");
  const priceFormatted = formatPrice(vehicle.price);

  const title = isEn
    ? `${vehicle.year} ${vehicle.make} ${vehicle.model} for Sale in ${locationText} (${priceFormatted}) | Car Relais`
    : `${vehicle.year} ${vehicle.make} ${vehicle.model} à vendre à ${locationText} (${priceFormatted}) | Car Relais`;

  const conditionText = isEn
    ? vehicle.condition === "NEW" ? "New" : "Used"
    : vehicle.condition === "NEW" ? "Neuf" : "Occasion";

  const description = isEn
    ? `${vehicle.title} — ${conditionText} vehicle for sale in ${locationText}. ${vehicle.mileage ? vehicle.mileage.toLocaleString() + " km, " : ""}${vehicle.transmission} transmission, ${vehicle.fuelType} fuel. Price: ${priceFormatted}. Verified seller on Car Relais.`
    : `${vehicle.title} — Véhicule ${conditionText.toLowerCase()} à vendre à ${locationText}. ${vehicle.mileage ? vehicle.mileage.toLocaleString() + " km, " : ""}boîte ${vehicle.transmission}, moteur ${vehicle.fuelType}. Prix : ${priceFormatted}. Vendeur vérifié sur Car Relais.`;

  const canonicalUrl = isEn
    ? `${baseUrl}/en/vehicles/${vehicle.slug}`
    : `${baseUrl}/vehicles/${vehicle.slug}`;

  const ogImages = vehicle.images && vehicle.images.length > 0
    ? [
        {
          url: vehicle.images[0],
          width: 1200,
          height: 800,
          alt: vehicle.title,
        },
      ]
    : undefined;

  return {
    title,
    description,
    alternates: {
      canonical: canonicalUrl,
      languages: {
        fr: `${baseUrl}/vehicles/${vehicle.slug}`,
        en: `${baseUrl}/en/vehicles/${vehicle.slug}`,
        "x-default": `${baseUrl}/vehicles/${vehicle.slug}`,
      },
    },
    openGraph: {
      title,
      description,
      url: canonicalUrl,
      type: "article",
      locale: isEn ? "en_US" : "fr_FR",
      siteName: "Car Relais",
      images: ogImages,
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: ogImages?.map((i) => i.url),
    },
  };
}

export default async function VehicleDetailPage(props: { params: Promise<{ slug: string; locale?: string }> }) {
  const params = await props.params;
  const isEn = params.locale === "en";
  const baseUrl = getBaseUrl();
  const vehicle = await getVehicleBySlug(params.slug);

  if (!vehicle || vehicle.status !== "PUBLISHED") {
    notFound();
  }

  const [currentUser] = await Promise.all([
    getCurrentUser(),
    connectToDatabase(),
  ]);

  interface OwnerUserDoc {
    role?: string;
  }
  const ownerUser = (vehicle.ownerId
    ? await UserModel.findById(vehicle.ownerId).select("role").lean()
    : null) as OwnerUserDoc | null;
  const isOwnerAdmin =
    ownerUser?.role === "ADMIN" ||
    ownerUser?.role === "SUPER_ADMIN" ||
    Boolean(vehicle.source) ||
    vehicle.seller?.role === "ADMIN" ||
    vehicle.seller?.role === "SUPER_ADMIN";
  const isViewerAdmin = currentUser?.role === "ADMIN" || currentUser?.role === "SUPER_ADMIN";
  const hidePublisher = isOwnerAdmin || isViewerAdmin;

  const isLocal = vehicle.availability === "IN_CONGO";
  const t = await getTranslations("VehicleDetail");
  const tVehicles = await getTranslations("Vehicles");

  const canonicalUrl = isEn
    ? `${baseUrl}/en/vehicles/${vehicle.slug}`
    : `${baseUrl}/vehicles/${vehicle.slug}`;

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
        item: isEn ? `${baseUrl}/en/vehicles` : `${baseUrl}/vehicles`,
      },
      {
        "@type": "ListItem",
        position: 3,
        name: vehicle.title,
        item: canonicalUrl,
      },
    ],
  };

  const jsonLdCar = {
    "@context": "https://schema.org",
    "@type": "Car",
    name: vehicle.title,
    description: vehicle.description || vehicle.title,
    image: vehicle.images,
    brand: {
      "@type": "Brand",
      name: vehicle.make,
    },
    model: vehicle.model,
    vehicleModelDate: vehicle.year?.toString(),
    mileageFromOdometer: vehicle.mileage
      ? {
          "@type": "QuantitativeValue",
          value: vehicle.mileage,
          unitCode: "KMT",
        }
      : undefined,
    vehicleTransmission: vehicle.transmission,
    fuelType: vehicle.fuelType,
    bodyType: vehicle.bodyType,
    color: vehicle.color || undefined,
    itemCondition:
      vehicle.condition === "NEW"
        ? "https://schema.org/NewCondition"
        : "https://schema.org/UsedCondition",
    offers: {
      "@type": "Offer",
      price: vehicle.price,
      priceCurrency: "USD",
      availability:
        vehicle.status === "PUBLISHED"
          ? "https://schema.org/InStock"
          : "https://schema.org/OutOfStock",
      url: canonicalUrl,
      seller: {
        "@type": vehicle.seller?.type === "DEALERSHIP" ? "AutoDealer" : "Person",
        name: vehicle.seller?.name || "Car Relais",
      },
    },
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLdBreadcrumb) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLdCar) }}
      />
      <div className="container mx-auto px-4 py-8 max-w-6xl">
        <VehicleViewTracker listingId={vehicle.id} />
        {/* Breadcrumbs */}
        <div className="text-sm text-zinc-500 mb-6 flex gap-2 items-center">
          <Link href="/" className="hover:text-primary">{t("home")}</Link>
          <span>/</span>
          <Link href="/vehicles" className="hover:text-primary">{t("vehicles")}</Link>
          <span>/</span>
          <span className="text-zinc-900 dark:text-zinc-100">{vehicle.title}</span>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">

          {/* Left Column: Images & Details */}
          <div className="lg:col-span-2 space-y-8">
            {/* Main Image Gallery */}
            <VehicleGallery
              images={vehicle.images}
              title={vehicle.title}
              isLocal={isLocal}
            />

            {/* Mobile title & price (shown on mobile, hidden on desktop - use p to avoid dual H1) */}
            <div className="lg:hidden">
              <div className="flex flex-wrap items-center gap-2 mb-2">
                {(vehicle.isFullOptions || vehicle.vehicleOptions?.includes("Full options")) && (
                  <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20">
                    <Sparkles className="w-3 h-3 text-amber-500" />
                    Full options
                  </span>
                )}
                {vehicle.saleType && (
                  <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-primary/10 text-primary border border-primary/20">
                    <Tag className="w-3 h-3" />
                    {vehicle.saleType}
                  </span>
                )}
              </div>
              <p className="text-2xl sm:text-3xl font-bold mb-2 text-zinc-900 dark:text-zinc-50">{vehicle.title}</p>
              <div className="text-3xl font-bold text-primary mb-3">{formatPrice(vehicle.price)}</div>
              <div className="flex flex-wrap items-center justify-between gap-2 text-zinc-600 dark:text-zinc-300">
                <div className="flex items-center gap-1.5">
                  <MapPin className="w-4 h-4 text-zinc-400" />
                  <span>{vehicle.location}</span>
                </div>
                {vehicle.createdAt && (
                  <div className="flex items-center gap-1.5 text-xs text-zinc-500 dark:text-zinc-400">
                  <Clock className="w-3.5 h-3.5 text-zinc-400" />
                  <span>{formatListingDate(vehicle.createdAt, params.locale)}</span>
                </div>
              )}
            </div>
          </div>

          {/* Specifications Grid */}
          <div className="bg-white dark:bg-zinc-900 p-6 rounded-2xl border border-zinc-100 dark:border-zinc-800/30">
            <h2 className="text-xl font-bold mb-6">{t("specifications")}</h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
              <div className="flex flex-col gap-1">
                <span className="text-zinc-500 text-sm flex items-center gap-1.5"><Calendar className="w-4 h-4" /> {t("year")}</span>
                <span className="font-semibold">{vehicle.year}</span>
              </div>
              <div className="flex flex-col gap-1">
                <span className="text-zinc-500 text-sm flex items-center gap-1.5"><Gauge className="w-4 h-4" /> {t("mileage")}</span>
                <span className="font-semibold">
                  {vehicle.mileage !== undefined && vehicle.mileage !== null ? `${vehicle.mileage.toLocaleString()} km` : "Non spécifié"}
                </span>
              </div>
              <div className="flex flex-col gap-1">
                <span className="text-zinc-500 text-sm flex items-center gap-1.5"><Settings className="w-4 h-4" /> {t("transmission")}</span>
                <span className="font-semibold">{(tVehicles as unknown as (k: string) => string)(vehicle.transmission)}</span>
              </div>
              <div className="flex flex-col gap-1">
                <span className="text-zinc-500 text-sm flex items-center gap-1.5"><Fuel className="w-4 h-4" /> {t("fuel")}</span>
                <span className="font-semibold">{(tVehicles as unknown as (k: string) => string)(vehicle.fuelType)}</span>
              </div>
              <div className="flex flex-col gap-1">
                <span className="text-zinc-500 text-sm flex items-center gap-1.5"><Car className="w-4 h-4" /> {t("bodyType")}</span>
                <span className="font-semibold">{vehicle.bodyType}</span>
              </div>
              <div className="flex flex-col gap-1">
                <span className="text-zinc-500 text-sm">{t("condition")}</span>
                <span className="font-semibold">{(tVehicles as unknown as (k: string) => string)(vehicle.condition)}</span>
              </div>
              <div className="flex flex-col gap-1">
                <span className="text-zinc-500 text-sm">{t("color")}</span>
                <span className="font-semibold">{vehicle.color || "N/A"}</span>
              </div>
              {vehicle.originalColor && (
                <div className="flex flex-col gap-1">
                  <span className="text-zinc-500 text-sm flex items-center gap-1.5"><Palette className="w-4 h-4" /> {t("originalColor")}</span>
                  <span className="font-semibold">{vehicle.originalColor}</span>
                </div>
              )}
              <div className="flex flex-col gap-1">
                <span className="text-zinc-500 text-sm flex items-center gap-1.5"><Tag className="w-4 h-4" /> {t("saleType")}</span>
                <span className="font-semibold">{vehicle.saleType || "Vente directe"}</span>
              </div>
              <div className="flex flex-col gap-1">
                <span className="text-zinc-500 text-sm flex items-center gap-1.5"><ShieldCheck className="w-4 h-4" /> {t("plate")}</span>
                <span className="font-semibold">
                  {vehicle.plateStatus === "WITHOUT_PLATE" || vehicle.vehicleOptions?.includes("Sans plaque")
                    ? (params.locale === "fr" ? "Sans plaque" : "Without plate")
                    : (params.locale === "fr" ? "Avec plaque" : "With plate")}
                </span>
              </div>
              <div className="flex flex-col gap-1">
                <span className="text-zinc-500 text-sm flex items-center gap-1.5"><Clock className="w-4 h-4" /> {t("published")}</span>
                <span className="font-semibold text-sm">{formatListingDate(vehicle.createdAt, params.locale, true)}</span>
              </div>
            </div>
          </div>

          {/* Features */}
          <div className="bg-white dark:bg-zinc-900 p-6 rounded-2xl border border-zinc-100 dark:border-zinc-800/30">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold">{t("keyFeatures")}</h2>
              {(vehicle.isFullOptions || vehicle.vehicleOptions?.includes("Full options")) && (
                <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20 rounded-full text-xs font-bold">
                  <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                  Full options
                </span>
              )}
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-y-4 gap-x-6">
              {(vehicle.isFullOptions || vehicle.vehicleOptions?.includes("Full options")) && (
                <div className="flex items-start gap-2">
                  <Check className="w-5 h-5 text-amber-500 shrink-0" />
                  <span className="text-zinc-900 dark:text-zinc-100 font-semibold">Full options</span>
                </div>
              )}
              {(vehicle.features || []).map((feature, idx) => (
                <div key={idx} className="flex items-start gap-2">
                  <Check className="w-5 h-5 text-primary shrink-0" />
                  <span className="text-zinc-700 dark:text-zinc-300">{feature}</span>
                </div>
              ))}
              {/* Dummy features if the vehicle has less than 3 */}
              {(vehicle.features || []).length < 3 && (
                <>
                  <div className="flex items-start gap-2">
                    <Check className="w-5 h-5 text-primary shrink-0" />
                    <span className="text-zinc-700 dark:text-zinc-300">{t("airConditioning")}</span>
                  </div>
                  <div className="flex items-start gap-2">
                    <Check className="w-5 h-5 text-primary shrink-0" />
                    <span className="text-zinc-700 dark:text-zinc-300">{t("bluetooth")}</span>
                  </div>
                  <div className="flex items-start gap-2">
                    <Check className="w-5 h-5 text-primary shrink-0" />
                    <span className="text-zinc-700 dark:text-zinc-300">{t("backupCamera")}</span>
                  </div>
                </>
              )}
            </div>
          </div>

          {/* Description */}
          <div className="bg-white dark:bg-zinc-900 p-6 rounded-2xl border border-zinc-100 dark:border-zinc-800/30">
            <h2 className="text-xl font-bold mb-4">{t("description")}</h2>
            <p className="text-zinc-700 dark:text-zinc-300 whitespace-pre-wrap leading-relaxed">
              {vehicle.description}
            </p>
          </div>
        </div>

        {/* Right Column: Pricing & Contact (Shown on desktop sticky, and visible on mobile below details) */}
        <div className="space-y-6">

          <div className="bg-white dark:bg-zinc-900 p-6 rounded-2xl border border-zinc-100 dark:border-zinc-800/30 shadow-sm lg:sticky lg:top-24">
            <div className="hidden lg:block">
              <div className="flex flex-wrap items-center gap-2 mb-2">
                {(vehicle.isFullOptions || vehicle.vehicleOptions?.includes("Full options")) && (
                  <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20">
                    <Sparkles className="w-3 h-3 text-amber-500" />
                    Full options
                  </span>
                )}
                {vehicle.saleType && (
                  <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-primary/10 text-primary border border-primary/20">
                    <Tag className="w-3 h-3" />
                    {vehicle.saleType}
                  </span>
                )}
              </div>
              <h1 className="text-2xl font-bold mb-2">{vehicle.title}</h1>
              <div className="text-4xl font-bold text-primary mb-4">{formatPrice(vehicle.price)}</div>

              <div className="flex items-center justify-between text-zinc-600 dark:text-zinc-300 mb-6 pb-6 border-b border-zinc-100 dark:border-zinc-800">
                <div className="flex items-center gap-2">
                  <MapPin className="w-5 h-5 text-zinc-400 shrink-0" />
                  <span className="line-clamp-1">{vehicle.location}</span>
                </div>
                {vehicle.createdAt && (
                  <span className="flex items-center gap-1 text-xs text-zinc-400 shrink-0">
                    <Clock className="w-3.5 h-3.5" />
                    {formatListingDate(vehicle.createdAt, params.locale)}
                  </span>
                )}
              </div>
            </div>

            <div className="space-y-4">
              {hidePublisher ? (
                <div className="pb-3 border-b border-zinc-100 dark:border-zinc-800">
                  <h3 className="font-bold text-lg text-zinc-900 dark:text-zinc-100">
                    {t("contactSeller")}
                  </h3>
                </div>
              ) : (
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 bg-zinc-100 dark:bg-zinc-800 rounded-full flex items-center justify-center shrink-0 text-xl font-bold text-primary">
                    {vehicle.seller.name.charAt(0)}
                  </div>
                  <div>
                    <div className="flex items-center gap-1.5">
                      {vehicle.seller.type === "DEALERSHIP" ? (
                        <Link href={`/dealers/${vehicle.seller.id}`} className="font-semibold text-lg hover:text-primary hover:underline transition-colors">
                          {vehicle.seller.name}
                        </Link>
                      ) : (
                        <h3 className="font-semibold text-lg">{vehicle.seller.name}</h3>
                      )}
                      {vehicle.seller.isVerified && <CheckCircle2 className="w-4 h-4 text-primary" />}
                    </div>
                    <div className="text-sm text-zinc-500 mb-1">
                      {vehicle.seller.type === "DEALERSHIP" ? t("verifiedDealership") : t("privateSeller")}
                    </div>
                    <div className="text-xs text-zinc-400">
                      {t("joined")} {new Date(vehicle.seller.joinedAt).getFullYear()}
                    </div>
                  </div>
                </div>
              )}

              <VehicleContactButtons
                listingId={vehicle.id}
                vehicleTitle={vehicle.title}
                whatsappLabel={t("whatsapp")}
                callLabel={t("callSeller")}
                phone={vehicle.seller.phone}
                whatsapp={vehicle.seller.whatsapp}
                source={vehicle.source}
                sourceUrl={vehicle.sourceUrl}
                contactOptions={vehicle.contactOptions}
              />

              <div className="pt-4 flex justify-center">
                <button className="text-sm text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200 flex items-center gap-1">
                  <ShieldAlert className="w-4 h-4" />
                  {t("reportListing")}
                </button>
              </div>
            </div>
          </div>

        </div>

      </div>
    </div>
    </>
  );
}
