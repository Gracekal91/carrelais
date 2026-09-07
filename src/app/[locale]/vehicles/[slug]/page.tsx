import { getVehicleBySlug } from "@/lib/data";
import { notFound } from "next/navigation";
import Image from "next/image";
import { Badge } from "@/components/ui/Badge";
import { formatPrice } from "@/lib/utils";
import { Button } from "@/components/ui/Button";
import { 
  MapPin, CheckCircle2, MessageCircle, Phone,
  Settings, Fuel, Calendar, Gauge, Car, ShieldAlert,
  Check
} from "lucide-react";
import { Link } from "@/i18n/routing";
import { VehicleGallery } from "@/components/vehicles/VehicleGallery";
import { VehicleViewTracker, VehicleContactButtons } from "@/components/vehicles/VehicleAnalyticsTracker";
import { getTranslations } from "next-intl/server";

export default async function VehicleDetailPage(props: { params: Promise<{ slug: string }> }) {
  const params = await props.params;
  const vehicle = getVehicleBySlug(params.slug);

  if (!vehicle || vehicle.status !== "PUBLISHED") {
    notFound();
  }

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
          
          {/* Mobile title & price (hidden on desktop, shown on mobile) */}
          <div className="lg:hidden">
            <h1 className="text-3xl font-bold mb-2">{vehicle.title}</h1>
            <div className="text-3xl font-bold text-primary mb-4">{formatPrice(vehicle.price)}</div>
            <div className="flex items-center gap-2 text-zinc-600 dark:text-zinc-300">
              <MapPin className="w-5 h-5 text-zinc-400" />
              <span>{vehicle.location}</span>
            </div>
          </div>

          {/* Specifications Grid */}
          <div className="bg-white dark:bg-zinc-900 p-6 rounded-2xl border border-zinc-100 dark:border-zinc-800/30">
            <h2 className="text-xl font-bold mb-6">{t("specifications")}</h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
              <div className="flex flex-col gap-1">
                <span className="text-zinc-500 text-sm flex items-center gap-1.5"><Calendar className="w-4 h-4"/> {t("year")}</span>
                <span className="font-semibold">{vehicle.year}</span>
              </div>
              <div className="flex flex-col gap-1">
                <span className="text-zinc-500 text-sm flex items-center gap-1.5"><Gauge className="w-4 h-4"/> {t("mileage")}</span>
                <span className="font-semibold">{vehicle.mileage.toLocaleString()} km</span>
              </div>
              <div className="flex flex-col gap-1">
                <span className="text-zinc-500 text-sm flex items-center gap-1.5"><Settings className="w-4 h-4"/> {t("transmission")}</span>
                <span className="font-semibold">{tVehicles(vehicle.transmission as any)}</span>
              </div>
              <div className="flex flex-col gap-1">
                <span className="text-zinc-500 text-sm flex items-center gap-1.5"><Fuel className="w-4 h-4"/> {t("fuel")}</span>
                <span className="font-semibold">{tVehicles(vehicle.fuelType as any)}</span>
              </div>
              <div className="flex flex-col gap-1">
                <span className="text-zinc-500 text-sm flex items-center gap-1.5"><Car className="w-4 h-4"/> {t("bodyType")}</span>
                <span className="font-semibold">{vehicle.bodyType}</span>
              </div>
              <div className="flex flex-col gap-1">
                <span className="text-zinc-500 text-sm">{t("condition")}</span>
                <span className="font-semibold">{tVehicles(vehicle.condition as any)}</span>
              </div>
              <div className="flex flex-col gap-1">
                <span className="text-zinc-500 text-sm">{t("engine")}</span>
                <span className="font-semibold">{vehicle.engineSize || "N/A"}</span>
              </div>
              <div className="flex flex-col gap-1">
                <span className="text-zinc-500 text-sm">{t("color")}</span>
                <span className="font-semibold">{vehicle.color || "N/A"}</span>
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

        {/* Right Column: Pricing & Contact */}
        <div className="space-y-6">
          
          {/* Desktop Title & Pricing */}
          <div className="hidden lg:block bg-white dark:bg-zinc-900 p-6 rounded-2xl border border-zinc-100 dark:border-zinc-800/30 shadow-sm sticky top-24">
            <h1 className="text-2xl font-bold mb-2">{vehicle.title}</h1>
            <div className="text-4xl font-bold text-primary mb-4">{formatPrice(vehicle.price)}</div>
            
            <div className="flex items-center gap-2 text-zinc-600 dark:text-zinc-300 mb-6 pb-6 border-b">
              <MapPin className="w-5 h-5 text-zinc-400" />
              <span>{vehicle.location}</span>
            </div>

            <div className="space-y-4">
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 bg-zinc-100 dark:bg-zinc-800 rounded-full flex items-center justify-center shrink-0 text-xl font-bold text-primary">
                  {vehicle.seller.name.charAt(0)}
                </div>
                <div>
                  <div className="flex items-center gap-1.5">
                    <h3 className="font-semibold text-lg">{vehicle.seller.name}</h3>
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

              <VehicleContactButtons 
                listingId={vehicle.id} 
                whatsappLabel={t("whatsapp")} 
                callLabel={t("callSeller")} 
              />
              
              <div className="pt-4 flex justify-center">
                <button className="text-sm text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200 flex items-center gap-1">
                  <ShieldAlert className="w-4 h-4" />
                  {t("reportListing")}
                </button>
              </div>
            </div>
          </div>
          
          {/* Mobile floating contact bar could be implemented here as a fixed bottom bar */}
        </div>

      </div>
    </div>
  );
}
