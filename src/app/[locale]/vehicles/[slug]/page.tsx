import { getVehicleBySlug } from "@/lib/data";
import { notFound } from "next/navigation";
import Image from "next/image";
import { Badge } from "@/components/ui/Badge";
import { formatPrice, formatListingDate } from "@/lib/utils";
import { Button } from "@/components/ui/Button";
import {
  MapPin, CheckCircle2, MessageCircle, Phone,
  Settings, Fuel, Calendar, Gauge, Car, ShieldAlert,
  Check, Clock
} from "lucide-react";
import { Link } from "@/i18n/routing";
import { VehicleGallery } from "@/components/vehicles/VehicleGallery";
import { VehicleViewTracker, VehicleContactButtons } from "@/components/vehicles/VehicleAnalyticsTracker";
import { getTranslations } from "next-intl/server";
import { getCurrentUser } from "@/lib/auth";
import { connectToDatabase } from "@/lib/mongodb";
import { UserModel } from "@/lib/models/User";

export default async function VehicleDetailPage(props: { params: Promise<{ slug: string; locale?: string }> }) {
  const params = await props.params;
  const vehicle = await getVehicleBySlug(params.slug);

  if (!vehicle || vehicle.status !== "PUBLISHED") {
    notFound();
  }

  const [currentUser] = await Promise.all([
    getCurrentUser(),
    connectToDatabase(),
  ]);

  const ownerUser = vehicle.ownerId ? await UserModel.findById(vehicle.ownerId).select("role").lean() : null;
  const isOwnerAdmin = (ownerUser as any)?.role === "ADMIN" || (ownerUser as any)?.role === "SUPER_ADMIN" || Boolean(vehicle.source) || vehicle.seller?.role === "ADMIN" || vehicle.seller?.role === "SUPER_ADMIN";
  const isViewerAdmin = currentUser?.role === "ADMIN" || currentUser?.role === "SUPER_ADMIN";
  const hidePublisher = isOwnerAdmin || isViewerAdmin;

  const isLocal = vehicle.availability === "IN_CONGO";
  const t = await getTranslations("VehicleDetail");
  const tVehicles = await getTranslations("Vehicles");

  return (
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

          {/* Mobile title & price (shown on mobile, hidden on desktop) */}
          <div className="lg:hidden">
            <h1 className="text-2xl sm:text-3xl font-bold mb-2">{vehicle.title}</h1>
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
                <span className="font-semibold">{tVehicles(vehicle.transmission as any)}</span>
              </div>
              <div className="flex flex-col gap-1">
                <span className="text-zinc-500 text-sm flex items-center gap-1.5"><Fuel className="w-4 h-4" /> {t("fuel")}</span>
                <span className="font-semibold">{tVehicles(vehicle.fuelType as any)}</span>
              </div>
              <div className="flex flex-col gap-1">
                <span className="text-zinc-500 text-sm flex items-center gap-1.5"><Car className="w-4 h-4" /> {t("bodyType")}</span>
                <span className="font-semibold">{vehicle.bodyType}</span>
              </div>
              <div className="flex flex-col gap-1">
                <span className="text-zinc-500 text-sm">{t("condition")}</span>
                <span className="font-semibold">{tVehicles(vehicle.condition as any)}</span>
              </div>
              <div className="flex flex-col gap-1">
                <span className="text-zinc-500 text-sm">{t("color")}</span>
                <span className="font-semibold">{vehicle.color || "N/A"}</span>
              </div>
              <div className="flex flex-col gap-1">
                <span className="text-zinc-500 text-sm flex items-center gap-1.5"><Clock className="w-4 h-4" /> {t("published")}</span>
                <span className="font-semibold text-sm">{formatListingDate(vehicle.createdAt, params.locale, true)}</span>
              </div>
            </div>
          </div>

          {/* Features */}
          <div className="bg-white dark:bg-zinc-900 p-6 rounded-2xl border border-zinc-100 dark:border-zinc-800/30">
            <h2 className="text-xl font-bold mb-6">{t("keyFeatures")}</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-y-4 gap-x-6">
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
  );
}
