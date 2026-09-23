import Image from "next/image";
import { Link } from "@/i18n/routing";
import { Badge } from "@/components/ui/Badge";
import { VehicleListing } from "@/types";
import { formatPrice, formatListingDate } from "@/lib/utils";
import { MapPin, CheckCircle2, Clock } from "lucide-react";
import { useTranslations, useLocale } from "next-intl";

interface VehicleCardProps {
  vehicle: VehicleListing;
  priority?: boolean;
}

export function VehicleCard({ vehicle, priority = false }: VehicleCardProps) {
  const isLocal = vehicle.availability === "IN_CONGO";
  const t = useTranslations("Vehicles");
  const locale = useLocale();
  const isAdminOrSourced = Boolean(vehicle.source) || (vehicle.seller as any)?.role === "ADMIN" || (vehicle.seller as any)?.role === "SUPER_ADMIN" || vehicle.seller?.name === "Car Relais";

  return (
    <Link href={`/vehicles/${vehicle.slug}`} className="group flex flex-col bg-white dark:bg-zinc-900 rounded-xl overflow-hidden border border-zinc-100 dark:border-zinc-800/30 hover:border-primary/50 dark:hover:border-primary/50 transition-colors shadow-sm hover:shadow-md">
      <div className="relative aspect-[4/3] w-full bg-zinc-100 overflow-hidden">
        <Image
          src={vehicle.images[0]}
          alt={vehicle.title}
          fill
          priority={priority}
          className="object-cover group-hover:scale-105 transition-transform duration-500"
          sizes="(max-width: 640px) calc(100vw - 32px), (max-width: 1024px) 50vw, (max-width: 1280px) 33vw, 280px"
        />
        <div className="absolute top-3 left-3 flex flex-col gap-2 z-10">
          {isLocal ? (
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-emerald-600 text-white shadow-md border border-emerald-500/40">
              <span>✓</span>
              <span>{t("availableInCongo")}</span>
            </span>
          ) : (
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-blue-600 text-white shadow-md border border-blue-500/40">
              <span>🚢</span>
              <span>{t("availableForImport")}</span>
            </span>
          )}
        </div>
      </div>
      
      <div className="p-4 flex flex-col flex-1">
        <div className="flex justify-between items-start mb-2">
          <h3 className="font-semibold text-lg line-clamp-1">{vehicle.title}</h3>
          <span className="font-bold text-lg text-primary">{formatPrice(vehicle.price)}</span>
        </div>
        
        <div className="text-sm text-zinc-500 dark:text-zinc-400 mb-3 flex items-center gap-2 flex-wrap">
          <span>{vehicle.year}</span>
          <span>&bull;</span>
          <span>{t(vehicle.transmission as any)}</span>
          {vehicle.mileage !== undefined && vehicle.mileage !== null && (
            <>
              <span>&bull;</span>
              <span>{(vehicle.mileage).toLocaleString()} km</span>
            </>
          )}
        </div>
        
        <div className="mt-auto pt-3 border-t border-zinc-100 dark:border-zinc-800/50 flex flex-col gap-2 text-sm text-zinc-600 dark:text-zinc-300">
          <div className="flex items-center justify-between text-xs text-zinc-500 dark:text-zinc-400">
            <div className="flex items-center gap-1.5 min-w-0 pr-2">
              <MapPin className="w-3.5 h-3.5 text-zinc-400 shrink-0" />
              <span className="truncate">{vehicle.location}</span>
            </div>
            {vehicle.createdAt && (
              <span className="flex items-center gap-1 shrink-0 text-zinc-400 dark:text-zinc-500">
                <Clock className="w-3 h-3 shrink-0" />
                <span>{formatListingDate(vehicle.createdAt, locale)}</span>
              </span>
            )}
          </div>
          
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-1.5">
              <span className="font-medium line-clamp-1">
                {isAdminOrSourced ? "Car Relais" : vehicle.seller.name}
              </span>
              {(vehicle.seller.isVerified || isAdminOrSourced) && (
                <CheckCircle2 className="w-4 h-4 text-primary" />
              )}
            </div>
            {vehicle.seller.type === "DEALERSHIP" && !isAdminOrSourced && (
              <Badge variant="default" className="text-[10px] uppercase tracking-wider px-1.5 py-0">{t("dealer")}</Badge>
            )}
          </div>
        </div>
      </div>
    </Link>
  );
}
