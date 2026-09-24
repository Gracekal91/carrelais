"use client";

import * as React from "react";
import { Search, ChevronDown, Check, SlidersHorizontal, RotateCcw, ShieldCheck } from "lucide-react";
import { VehicleListing } from "@/types";
import { VehicleCard } from "@/components/vehicles/VehicleCard";
import { useTranslations } from "next-intl";

interface DealerInventorySectionProps {
  activeVehicles: VehicleListing[];
  soldVehicles?: VehicleListing[];
}

export default function DealerInventorySection({
  activeVehicles = [],
  soldVehicles = [],
}: DealerInventorySectionProps) {
  const t = useTranslations("DealerProfile.inventory");

  const [searchQuery, setSearchQuery] = React.useState("");
  const [selectedMake, setSelectedMake] = React.useState("ALL");
  const [selectedBodyType, setSelectedBodyType] = React.useState("ALL");
  const [maxPrice, setMaxPrice] = React.useState<number | "ALL">("ALL");
  const [showSold, setShowSold] = React.useState(false);

  // Extract unique makes and bodyTypes from active listings
  const availableMakes = React.useMemo(() => {
    const set = new Set(activeVehicles.map(v => v.make).filter(Boolean));
    return Array.from(set).sort();
  }, [activeVehicles]);

  const availableBodyTypes = React.useMemo(() => {
    const set = new Set(activeVehicles.map(v => v.bodyType).filter(Boolean));
    return Array.from(set).sort();
  }, [activeVehicles]);

  // Filter logic
  const filteredVehicles = React.useMemo(() => {
    return activeVehicles.filter(vehicle => {
      // Search query (make, model, year, title)
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase().trim();
        const matchesTitle = vehicle.title?.toLowerCase().includes(q);
        const matchesMake = vehicle.make?.toLowerCase().includes(q);
        const matchesModel = vehicle.model?.toLowerCase().includes(q);
        const matchesYear = vehicle.year ? String(vehicle.year).includes(q) : false;
        if (!matchesTitle && !matchesMake && !matchesModel && !matchesYear) {
          return false;
        }
      }

      // Make filter
      if (selectedMake !== "ALL" && vehicle.make !== selectedMake) {
        return false;
      }

      // Body Type filter
      if (selectedBodyType !== "ALL" && vehicle.bodyType !== selectedBodyType) {
        return false;
      }

      // Price filter
      if (maxPrice !== "ALL" && vehicle.price > maxPrice) {
        return false;
      }

      return true;
    });
  }, [activeVehicles, searchQuery, selectedMake, selectedBodyType, maxPrice]);

  const resetFilters = () => {
    setSearchQuery("");
    setSelectedMake("ALL");
    setSelectedBodyType("ALL");
    setMaxPrice("ALL");
  };

  const hasActiveFilters = searchQuery !== "" || selectedMake !== "ALL" || selectedBodyType !== "ALL" || maxPrice !== "ALL";

  return (
    <div className="space-y-6">
      {/* Section Header with Count */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-3">
            <h2 className="text-2xl font-bold text-zinc-900 dark:text-zinc-100">
              {t("title")}
            </h2>
            <span className="px-3 py-1 rounded-full bg-primary/10 text-primary font-bold text-xs">
              {filteredVehicles.length === 1
                ? t("singleCount")
                : t("count", { count: filteredVehicles.length })}
            </span>
          </div>
          <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-1">
            Découvrez le catalogue complet des véhicules actuellement en vente
          </p>
        </div>

        {hasActiveFilters && (
          <button
            type="button"
            onClick={resetFilters}
            className="flex items-center gap-1.5 text-xs text-primary hover:underline font-semibold w-fit"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            {t("resetFilters")}
          </button>
        )}
      </div>

      {/* Lightweight Filter Bar */}
      <div className="bg-white dark:bg-zinc-900 p-4 rounded-2xl border border-zinc-200 dark:border-zinc-800 shadow-xs space-y-3">
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3">
          {/* Search Input */}
          <div className="relative">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              placeholder={t("searchPlaceholder")}
              className="w-full h-10 pl-10 pr-3 rounded-xl border border-zinc-200 dark:border-zinc-700 bg-zinc-50/50 dark:bg-zinc-800 text-xs text-zinc-900 dark:text-zinc-100 placeholder:text-zinc-400 focus:outline-hidden focus:ring-2 focus:ring-primary/20 focus:border-primary"
            />
          </div>

          {/* Make Select */}
          <div>
            <select
              value={selectedMake}
              onChange={e => setSelectedMake(e.target.value)}
              className="w-full h-10 px-3 rounded-xl border border-zinc-200 dark:border-zinc-700 bg-zinc-50/50 dark:bg-zinc-800 text-xs text-zinc-800 dark:text-zinc-200 focus:outline-hidden focus:ring-2 focus:ring-primary/20 focus:border-primary"
            >
              <option value="ALL">{t("allMakes")}</option>
              {availableMakes.map(m => (
                <option key={m} value={m}>{m}</option>
              ))}
            </select>
          </div>

          {/* Body Type Select */}
          <div>
            <select
              value={selectedBodyType}
              onChange={e => setSelectedBodyType(e.target.value)}
              className="w-full h-10 px-3 rounded-xl border border-zinc-200 dark:border-zinc-700 bg-zinc-50/50 dark:bg-zinc-800 text-xs text-zinc-800 dark:text-zinc-200 focus:outline-hidden focus:ring-2 focus:ring-primary/20 focus:border-primary"
            >
              <option value="ALL">{t("allBodyTypes")}</option>
              {availableBodyTypes.map(bt => (
                <option key={bt} value={bt}>{bt}</option>
              ))}
            </select>
          </div>

          {/* Price Max Select */}
          <div>
            <select
              value={maxPrice}
              onChange={e => setMaxPrice(e.target.value === "ALL" ? "ALL" : Number(e.target.value))}
              className="w-full h-10 px-3 rounded-xl border border-zinc-200 dark:border-zinc-700 bg-zinc-50/50 dark:bg-zinc-800 text-xs text-zinc-800 dark:text-zinc-200 focus:outline-hidden focus:ring-2 focus:ring-primary/20 focus:border-primary"
            >
              <option value="ALL">{t("allPrices")}</option>
              <option value="15000">Jusqu&apos;à $15,000</option>
              <option value="30000">Jusqu&apos;à $30,000</option>
              <option value="50000">Jusqu&apos;à $50,000</option>
              <option value="80000">Jusqu&apos;à $80,000</option>
            </select>
          </div>
        </div>
      </div>

      {/* Vehicle Grid using the existing VehicleCard component */}
      {filteredVehicles.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredVehicles.map(vehicle => (
            <VehicleCard key={vehicle.id} vehicle={vehicle} />
          ))}
        </div>
      ) : (
        <div className="bg-white dark:bg-zinc-900 rounded-2xl border border-dashed border-zinc-300 dark:border-zinc-800 p-12 text-center space-y-3">
          <p className="text-sm text-zinc-500 dark:text-zinc-400 font-medium">
            {t("noResults")}
          </p>
          <button
            type="button"
            onClick={resetFilters}
            className="px-4 py-2 bg-zinc-100 dark:bg-zinc-800 hover:bg-zinc-200 dark:hover:bg-zinc-700 text-zinc-800 dark:text-zinc-200 rounded-lg text-xs font-semibold transition-colors"
          >
            {t("resetFilters")}
          </button>
        </div>
      )}

      {/* Optional Sold Vehicles Section */}
      {soldVehicles && soldVehicles.length > 0 && (
        <div className="pt-8 border-t border-zinc-200 dark:border-zinc-800 space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-bold text-zinc-900 dark:text-zinc-100 flex items-center gap-2">
                <ShieldCheck className="w-5 h-5 text-zinc-400" />
                {t("soldTitle")} ({soldVehicles.length})
              </h3>
              <p className="text-xs text-zinc-500 dark:text-zinc-400">
                {t("soldSubtitle")}
              </p>
            </div>
            <button
              type="button"
              onClick={() => setShowSold(!showSold)}
              className="text-xs font-semibold text-primary hover:underline"
            >
              {showSold ? "Masquer les véhicules vendus" : "Afficher les véhicules vendus"}
            </button>
          </div>

          {showSold && (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 opacity-75 grayscale-25 animate-in fade-in">
              {soldVehicles.map(vehicle => (
                <div key={vehicle.id} className="relative">
                  <VehicleCard vehicle={vehicle} />
                  <div className="absolute top-3 right-3 z-20 bg-zinc-900/90 text-white text-xs font-bold px-2.5 py-1 rounded-md shadow-md uppercase tracking-wider">
                    Vendu
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
