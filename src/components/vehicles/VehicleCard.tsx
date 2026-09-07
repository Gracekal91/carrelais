import Image from "next/image";
import { Link } from "@/i18n/routing";
import { Badge } from "@/components/ui/Badge";
import { VehicleListing } from "@/types";
import { formatPrice } from "@/lib/utils";
import { MapPin, CheckCircle2 } from "lucide-react";
import { useTranslations } from "next-intl";

interface VehicleCardProps {
  vehicle: VehicleListing;
}

export function VehicleCard({ vehicle }: VehicleCardProps) {
  const isLocal = vehicle.availability === "IN_CONGO";
  const t = useTranslations("Vehicles");

  return (
    <Link href={`/vehicles/${vehicle.slug}`} className="group flex flex-col bg-white dark:bg-zinc-900 rounded-xl overflow-hidden border border-zinc-100 dark:border-zinc-800/30 hover:border-primary/50 dark:hover:border-primary/50 transition-colors shadow-sm hover:shadow-md">
      <div className="relative aspect-[4/3] w-full bg-zinc-100 overflow-hidden">
        <Image
          src={vehicle.images[0]}
          alt={vehicle.title}
          fill
          className="object-cover group-hover:scale-105 transition-transform duration-500"
          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
        />
        <div className="absolute top-3 left-3 flex flex-col gap-2">
          {isLocal ? (
            <Badge variant="success" className="bg-white/90 backdrop-blur-sm border border-green-200">
              ✓ {t("availableInCongo")}
            </Badge>
          ) : (
            <Badge variant="import" className="bg-white/90 backdrop-blur-sm border border-blue-200">
              🚢 {t("availableForImport")}
            </Badge>
          )}
        </div>
      </div>
      
      <div className="p-4 flex flex-col flex-1">
        <div className="flex justify-between items-start mb-2">
          <h3 className="font-semibold text-lg line-clamp-1">{vehicle.title}</h3>
          <span className="font-bold text-lg text-primary">{formatPrice(vehicle.price)}</span>
        </div>
        
        <div className="text-sm text-zinc-500 dark:text-zinc-400 mb-4 flex items-center gap-2">
          <span>{vehicle.year}</span>
          <span>&bull;</span>
          <span>{t(vehicle.transmission as any)}</span>
          <span>&bull;</span>
          <span>{(vehicle.mileage).toLocaleString()} km</span>
        </div>
        
        <div className="mt-auto pt-4 border-t border-zinc-100 dark:border-zinc-800/50 flex flex-col gap-2 text-sm text-zinc-600 dark:text-zinc-300">
          <div className="flex items-center gap-1.5">
            <MapPin className="w-4 h-4 text-zinc-400" />
            <span className="line-clamp-1">{vehicle.location}</span>
          </div>
          
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-1.5">
              <span className="font-medium line-clamp-1">{vehicle.seller.name}</span>
              {vehicle.seller.isVerified && (
                <CheckCircle2 className="w-4 h-4 text-primary" />
              )}
            </div>
            {vehicle.seller.type === "DEALERSHIP" && (
              <Badge variant="default" className="text-[10px] uppercase tracking-wider px-1.5 py-0">{t("dealer")}</Badge>
            )}
          </div>
        </div>
      </div>
    </Link>
  );
}
