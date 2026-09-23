"use client";

import { useState, useMemo } from "react";
import { useSearchParams } from "next/navigation";
import Image from "next/image";
import { useRouter, Link } from "@/i18n/routing";
import { cn, formatPrice, formatListingDate } from "@/lib/utils";
import {
  SlidersHorizontal, X, ChevronDown, Check,
  LayoutGrid, List, MapPin, CheckCircle2, Fuel, Settings, Calendar, Clock,
} from "lucide-react";
import { Select } from "@/components/ui/Select";
import { Badge } from "@/components/ui/Badge";
import { VehicleCard } from "@/components/vehicles/VehicleCard";
import { VehicleListing } from "@/types";
import { MAKES_AND_MODELS, PRICE_OPTIONS_CASH, YEAR_OPTIONS } from "@/lib/search-constants";
import { useTranslations, useLocale } from "next-intl";

// ─── Primitives ────────────────────────────────────────────────────────────────
function RadioOption({ label, value, selected, onChange }: {
  label: string; value: string; selected: boolean; onChange: (v: string) => void;
}) {
  return (
    <button
      type="button"
      onClick={() => onChange(value)}
      className="flex items-start justify-start text-left gap-3 w-full py-2 group cursor-pointer"
    >
      <span className={cn(
        "w-4 h-4 rounded-full border-2 flex items-center justify-center shrink-0 mt-0.5 transition-colors",
        selected ? "border-primary bg-primary" : "border-zinc-300 dark:border-zinc-600 group-hover:border-primary/60"
      )}>
        {selected && <span className="w-1.5 h-1.5 rounded-full bg-white" />}
      </span>
      <span className={cn("text-sm text-left leading-normal", selected ? "font-semibold text-primary" : "text-zinc-700 dark:text-zinc-300")}>
        {label}
      </span>
    </button>
  );
}

function CheckboxOption({ label, checked, onChange }: {
  label: string; checked: boolean; onChange: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onChange}
      className="flex items-start justify-start text-left gap-3 w-full py-2 group cursor-pointer"
    >
      <span className={cn(
        "w-4 h-4 rounded border-2 flex items-center justify-center shrink-0 mt-0.5 transition-colors",
        checked ? "border-primary bg-primary" : "border-zinc-300 dark:border-zinc-600 group-hover:border-primary/60"
      )}>
        {checked && <Check className="w-2.5 h-2.5 text-white stroke-[3]" />}
      </span>
      <span className={cn("text-sm text-left leading-normal", checked ? "font-semibold text-primary" : "text-zinc-700 dark:text-zinc-300")}>
        {label}
      </span>
    </button>
  );
}

function FilterSection({ title, children, defaultOpen = true }: {
  title: string; children: React.ReactNode; defaultOpen?: boolean;
}) {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <div className="border-b border-zinc-200 dark:border-zinc-800 py-3.5 last:border-0 text-left">
      <button
        type="button"
        onClick={() => setOpen(!open)}
        className="flex items-center justify-between w-full mb-1 text-left cursor-pointer group"
      >
        <span className="font-semibold text-sm text-zinc-900 dark:text-white text-left group-hover:text-primary transition-colors">
          {title}
        </span>
        <ChevronDown className={cn("w-4 h-4 text-zinc-400 transition-transform shrink-0", open && "rotate-180")} />
      </button>
      {open && <div className="mt-2 space-y-0.5 text-left">{children}</div>}
    </div>
  );
}

// ─── Types & Constants ─────────────────────────────────────────────────────────
interface FilterState {
  make: string; model: string;
  minPrice: string; maxPrice: string;
  minYear: string; maxYear: string;
  availability: string;
  transmission: string[];
  fuelType: string[];
  condition: string;
}

const SORT_OPTIONS_KEYS = [
  { value: "newest", labelKey: "sortNewest" },
  { value: "price_asc", labelKey: "sortPriceAsc" },
  { value: "price_desc", labelKey: "sortPriceDesc" },
  { value: "year_desc", labelKey: "sortYearDesc" },
  { value: "year_asc", labelKey: "sortYearAsc" },
  { value: "mileage_asc", labelKey: "sortMileageAsc" },
];
const TRANSMISSION_OPTIONS_KEYS = ["Automatic", "Manual"]; // We can translate these dynamically if needed, or keep them as is and translate via key
const FUEL_OPTIONS_KEYS = ["Petrol", "Diesel", "Hybrid", "Electric"];

const CONDITION_OPTIONS_KEYS = [
  { value: "", labelKey: "any" },
  { value: "New", labelKey: "new" },
  { value: "Used", labelKey: "used" },
];
const AVAILABILITY_OPTIONS_KEYS = [
  { value: "", labelKey: "any" },
  { value: "IN_CONGO", labelKey: "availableInCongo" },
  { value: "IMPORT", labelKey: "availableForImport" },
];

// ─── Main Component ────────────────────────────────────────────────────────────
export function VehiclesPage({
  vehicles,
  totalCount,
  currentPage,
  totalPages,
}: {
  vehicles: VehicleListing[];
  totalCount: number;
  currentPage: number;
  totalPages: number;
}) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const t = useTranslations("Vehicles");

  const [mobileOpen, setMobileOpen] = useState(false);
  const [sort, setSort] = useState(searchParams.get("sort") || "newest");
  const [view, setView] = useState<"grid" | "list">("grid");

  const [filters, setFilters] = useState<FilterState>({
    make: searchParams.get("make") || "",
    model: searchParams.get("model") || "",
    minPrice: searchParams.get("minPrice") || "",
    maxPrice: searchParams.get("maxPrice") || "",
    minYear: searchParams.get("minYear") || "",
    maxYear: searchParams.get("maxYear") || "",
    availability: searchParams.get("availability") || "",
    transmission: searchParams.get("transmission")?.split(",").filter(Boolean) || [],
    fuelType: searchParams.get("fuelType")?.split(",").filter(Boolean) || [],
    condition: searchParams.get("condition") || "",
  });

  const makeOptions = [
    { value: "", label: t("allMakes") },
    ...MAKES_AND_MODELS.map(m => ({ value: m.make, label: m.make })),
  ];

  const modelOptions = useMemo(() => {
    const found = MAKES_AND_MODELS.find(m => m.make === filters.make);
    return [
      { value: "", label: t("allModels") },
      ...(found?.models.map(m => ({ value: m.name, label: m.name })) || []),
    ];
  }, [filters.make, t]);

  const setFilter = <K extends keyof FilterState>(key: K, value: FilterState[K]) =>
    setFilters(prev => ({ ...prev, [key]: value }));

  const toggleMulti = (key: "transmission" | "fuelType", val: string) =>
    setFilters(prev => ({
      ...prev,
      [key]: prev[key].includes(val)
        ? (prev[key] as string[]).filter(v => v !== val)
        : [...(prev[key] as string[]), val],
    }));

  const activeFilterCount = [
    filters.make, filters.availability, filters.condition,
    ...filters.transmission, ...filters.fuelType,
    filters.minPrice, filters.maxPrice, filters.minYear, filters.maxYear,
  ].filter(Boolean).length;

  const applyFilters = () => {
    const params = new URLSearchParams();
    if (filters.make) params.set("make", filters.make);
    if (filters.model) params.set("model", filters.model);
    if (filters.minPrice) params.set("minPrice", filters.minPrice);
    if (filters.maxPrice) params.set("maxPrice", filters.maxPrice);
    if (filters.minYear) params.set("minYear", filters.minYear);
    if (filters.maxYear) params.set("maxYear", filters.maxYear);
    if (filters.availability) params.set("availability", filters.availability);
    if (filters.transmission.length) params.set("transmission", filters.transmission.join(","));
    if (filters.fuelType.length) params.set("fuelType", filters.fuelType.join(","));
    if (filters.condition) params.set("condition", filters.condition);
    if (sort !== "newest") params.set("sort", sort);
    router.push(`/vehicles?${params.toString()}`);
    setMobileOpen(false);
  };

  const clearFilters = () => {
    setFilters({
      make: "",
      model: "",
      minPrice: "",
      maxPrice: "",
      minYear: "",
      maxYear: "",
      availability: "",
      transmission: [],
      fuelType: [],
      condition: "",
    });
    router.push("/vehicles");
    setMobileOpen(false);
  };

  const FilterSectionsContent = (
    <div className="text-left space-y-0.5">
      <FilterSection title={t("availability")}>
        {AVAILABILITY_OPTIONS_KEYS.map(({ value, labelKey }) => (
          <RadioOption key={value} value={value} label={t(labelKey as any)}
            selected={filters.availability === value}
            onChange={val => setFilter("availability", val)}
          />
        ))}
      </FilterSection>

      <FilterSection title={t("makeAndModel")}>
        <div className="space-y-2">
          <Select value={filters.make} onChange={val => { setFilter("make", val); setFilter("model", ""); }}
            options={makeOptions} placeholder={t("allMakes")} />
          {filters.make && (
            <Select value={filters.model} onChange={val => setFilter("model", val)}
              options={modelOptions} placeholder={t("allModels")} />
          )}
        </div>
      </FilterSection>

      <FilterSection title={t("priceRange")}>
        <div className="grid grid-cols-2 gap-2">
          <Select value={filters.minPrice}
            onChange={val => { setFilter("minPrice", val); if (filters.maxPrice && Number(val) >= Number(filters.maxPrice)) setFilter("maxPrice", ""); }}
            options={PRICE_OPTIONS_CASH.filter(o => !filters.maxPrice || Number(o.value) < Number(filters.maxPrice))}
            placeholder={t("min")} />
          <Select value={filters.maxPrice}
            onChange={val => { setFilter("maxPrice", val); if (filters.minPrice && Number(val) <= Number(filters.minPrice)) setFilter("minPrice", ""); }}
            options={PRICE_OPTIONS_CASH.filter(o => !filters.minPrice || Number(o.value) > Number(filters.minPrice))}
            placeholder={t("max")} />
        </div>
      </FilterSection>

      <FilterSection title={t("yearRange")}>
        <div className="grid grid-cols-2 gap-2">
          <Select value={filters.minYear}
            onChange={val => { setFilter("minYear", val); if (filters.maxYear && Number(val) >= Number(filters.maxYear)) setFilter("maxYear", ""); }}
            options={YEAR_OPTIONS.filter(o => !filters.maxYear || Number(o.value) < Number(filters.maxYear))}
            placeholder={t("from")} />
          <Select value={filters.maxYear}
            onChange={val => { setFilter("maxYear", val); if (filters.minYear && Number(val) <= Number(filters.minYear)) setFilter("minYear", ""); }}
            options={YEAR_OPTIONS.filter(o => !filters.minYear || Number(o.value) > Number(filters.minYear))}
            placeholder={t("to")} />
        </div>
      </FilterSection>

      <FilterSection title={t("transmission")}>
        {TRANSMISSION_OPTIONS_KEYS.map(tr => (
          <CheckboxOption key={tr} label={t(tr as any)} checked={filters.transmission.includes(tr)}
            onChange={() => toggleMulti("transmission", tr)} />
        ))}
      </FilterSection>

      <FilterSection title={t("fuelType")}>
        {FUEL_OPTIONS_KEYS.map(f => (
          <CheckboxOption key={f} label={t(f as any)} checked={filters.fuelType.includes(f)}
            onChange={() => toggleMulti("fuelType", f)} />
        ))}
      </FilterSection>

      <FilterSection title={t("condition")} defaultOpen={false}>
        {CONDITION_OPTIONS_KEYS.map(c => (
          <RadioOption key={c.value} value={c.value} label={t(c.labelKey as any)}
            selected={filters.condition === c.value}
            onChange={val => setFilter("condition", val)} />
        ))}
      </FilterSection>
    </div>
  );

  return (
    <div className="container mx-auto px-4 py-6 md:py-10 max-w-7xl pb-28 lg:pb-12">
      {/* Page header */}
      <div className="mb-4 md:mb-8">
        <h1 className="text-2xl md:text-3xl font-bold mb-1">{t("title")}</h1>
        <p className="text-zinc-500 dark:text-zinc-400 text-xs md:text-sm">
          {totalCount === 1 ? t("resultsFound", { count: totalCount }) : t("resultsFoundPlural", { count: totalCount })}
        </p>
      </div>

      {/* Toolbar */}
      <div className="flex flex-col gap-3 mb-6 pb-4 border-b border-zinc-200 dark:border-zinc-800">
        <div className="flex items-center justify-between gap-3">
          {/* Mobile filter trigger */}
          <button
            type="button"
            aria-label={t("filters")}
            onClick={() => setMobileOpen(true)}
            className="lg:hidden flex items-center gap-2 h-11 px-4 rounded-xl border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-900 text-sm font-semibold text-zinc-900 dark:text-white shadow-2xs hover:bg-zinc-50 dark:hover:bg-zinc-800 active:scale-95 transition-all cursor-pointer"
          >
            <SlidersHorizontal className="w-4 h-4 text-primary" />
            <span>{t("filters")}</span>
            {activeFilterCount > 0 && (
              <span className="w-5 h-5 rounded-full bg-primary text-white text-xs font-bold flex items-center justify-center">
                {activeFilterCount}
              </span>
            )}
          </button>

          {/* Sort & View Toggle */}
          <div className="flex items-center gap-2 ml-auto">
            <div className="w-36 sm:w-48">
              <Select 
                value={sort} 
                onChange={val => { setSort(val); }} 
                options={SORT_OPTIONS_KEYS.map(s => ({ value: s.value, label: t(s.labelKey as any) }))} 
                placeholder={t("sortBy")} 
                className="h-11 text-xs sm:text-sm"
              />
            </div>
            {/* View toggle */}
            <div className="flex border border-zinc-300 dark:border-zinc-700 rounded-xl overflow-hidden h-11 bg-white dark:bg-zinc-900">
              {(["grid", "list"] as const).map(v => (
                <button
                  key={v}
                  type="button"
                  aria-label={v === "grid" ? "Affichage en grille" : "Affichage en liste"}
                  onClick={() => setView(v)}
                  className={cn(
                    "h-full w-10 flex items-center justify-center transition-colors cursor-pointer",
                    view === v ? "bg-primary text-white" : "text-zinc-500 hover:bg-zinc-100 dark:hover:bg-zinc-800"
                  )}
                >
                  {v === "grid" ? <LayoutGrid className="w-4 h-4" /> : <List className="w-4 h-4" />}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Active filter chips (Horizontally scrollable on mobile) */}
        {activeFilterCount > 0 && (
          <div className="flex overflow-x-auto no-scrollbar gap-1.5 py-1 -mx-4 px-4 sm:mx-0 sm:px-0">
            {filters.availability && (
              <span className="flex items-center gap-1 text-xs bg-primary/10 text-primary rounded-full px-3 py-1 font-medium shrink-0">
                {t(AVAILABILITY_OPTIONS_KEYS.find(o => o.value === filters.availability)?.labelKey as any)}
                <button type="button" aria-label="Supprimer le filtre de disponibilité" onClick={() => setFilter("availability", "")} className="cursor-pointer"><X className="w-3 h-3" /></button>
              </span>
            )}
            {filters.make && (
              <span className="flex items-center gap-1 text-xs bg-primary/10 text-primary rounded-full px-3 py-1 font-medium shrink-0">
                {filters.make}{filters.model ? ` › ${filters.model}` : ""}
                <button type="button" aria-label="Supprimer le filtre de marque" onClick={() => { setFilter("make", ""); setFilter("model", ""); }} className="cursor-pointer"><X className="w-3 h-3" /></button>
              </span>
            )}
            {filters.transmission.map(tr => (
              <span key={tr} className="flex items-center gap-1 text-xs bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 rounded-full px-3 py-1 shrink-0">
                {t(tr as any)}<button type="button" aria-label="Supprimer le filtre de boîte de vitesses" onClick={() => toggleMulti("transmission", tr)} className="cursor-pointer"><X className="w-3 h-3" /></button>
              </span>
            ))}
            {filters.fuelType.map(f => (
              <span key={f} className="flex items-center gap-1 text-xs bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 rounded-full px-3 py-1 shrink-0">
                {t(f as any)}<button type="button" aria-label="Supprimer le filtre de carburant" onClick={() => toggleMulti("fuelType", f)} className="cursor-pointer"><X className="w-3 h-3" /></button>
              </span>
            ))}
          </div>
        )}
      </div>

      {/* Body: sidebar + results */}
      <div className="flex gap-8 items-start">
        {/* Desktop sidebar */}
        <aside className="hidden lg:block w-64 xl:w-72 shrink-0 sticky top-20 max-h-[calc(100vh-6rem)] overflow-y-auto bg-white dark:bg-zinc-900 rounded-2xl border border-zinc-200 dark:border-zinc-800 p-5 text-left shadow-xs">
          <div className="flex items-center justify-between mb-3 text-left">
            <h2 className="font-bold text-base text-zinc-900 dark:text-white text-left">{t("filters")}</h2>
            {activeFilterCount > 0 && (
              <button type="button" onClick={clearFilters} className="text-xs text-primary hover:underline cursor-pointer font-medium">
                {t("clearFilters")} ({activeFilterCount})
              </button>
            )}
          </div>
          {FilterSectionsContent}
          <div className="flex gap-2 pt-4 border-t border-zinc-200 dark:border-zinc-800 mt-2">
            <button type="button" onClick={clearFilters}
              className="flex-1 h-10 rounded-xl border border-zinc-300 dark:border-zinc-700 text-sm font-medium text-zinc-700 dark:text-zinc-300 hover:bg-zinc-50 dark:hover:bg-zinc-800 transition-colors cursor-pointer">
              {t("clearAll")}
            </button>
            <button type="button" onClick={applyFilters}
              className="flex-1 h-10 rounded-xl bg-primary text-white text-sm font-semibold hover:bg-primary/90 transition-colors shadow-sm shadow-primary/20 cursor-pointer">
              {t("apply")}
            </button>
          </div>
        </aside>

        {/* Mobile Filter Bottom Sheet / Modal */}
        {mobileOpen && (
          <div className="fixed inset-0 z-[200] lg:hidden flex flex-col justify-end">
            <div 
              className="fixed inset-0 bg-black/60 backdrop-blur-xs transition-opacity" 
              onClick={() => setMobileOpen(false)} 
            />
            <div className="relative w-full max-h-[85vh] bg-white dark:bg-zinc-900 rounded-t-3xl shadow-2xl flex flex-col overflow-hidden text-left z-10 animate-in slide-in-from-bottom duration-250">
              {/* Sheet Drag Pill */}
              <div className="w-12 h-1.5 bg-zinc-300 dark:bg-zinc-700 rounded-full mx-auto mt-3 mb-1" />
              
              {/* Header */}
              <div className="flex items-center justify-between px-5 py-3 border-b border-zinc-100 dark:border-zinc-800">
                <div className="flex items-center gap-2">
                  <h2 className="font-bold text-lg text-zinc-900 dark:text-white">{t("filters")}</h2>
                  {activeFilterCount > 0 && (
                    <span className="w-5 h-5 rounded-full bg-primary text-white text-xs font-bold flex items-center justify-center">
                      {activeFilterCount}
                    </span>
                  )}
                </div>
                <button 
                  type="button" 
                  onClick={() => setMobileOpen(false)}
                  className="p-2 rounded-full hover:bg-zinc-100 dark:hover:bg-zinc-800 text-zinc-500 cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Scrollable Filters */}
              <div className="flex-1 overflow-y-auto px-5 py-2">
                {FilterSectionsContent}
              </div>

              {/* Pinned Bottom Actions */}
              <div className="border-t border-zinc-200 dark:border-zinc-800 p-4 bg-white dark:bg-zinc-900 flex gap-3 pb-[max(env(safe-area-inset-bottom),1rem)]">
                <button
                  type="button"
                  onClick={clearFilters}
                  className="flex-1 h-12 rounded-xl border border-zinc-300 dark:border-zinc-700 font-semibold text-sm text-zinc-700 dark:text-zinc-300 hover:bg-zinc-50 dark:hover:bg-zinc-800 active:bg-zinc-100 transition-colors cursor-pointer"
                >
                  {t("clearAll")}
                </button>
                <button
                  type="button"
                  onClick={applyFilters}
                  className="flex-1 h-12 rounded-xl bg-primary text-white font-bold text-sm hover:bg-primary/90 active:scale-[0.99] transition-all shadow-md shadow-primary/20 cursor-pointer flex items-center justify-center"
                >
                  {t("apply")}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Results grid / list */}
        <div className="flex-1 min-w-0">
          {vehicles.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-24 text-center">
              <div className="text-5xl mb-4">🔍</div>
              <h3 className="text-xl font-semibold mb-2">{t("noVehicles")}</h3>
              <p className="text-zinc-500 mb-6">{t("tryAdjusting")}</p>
              <button type="button" onClick={clearFilters}
                className="h-10 px-6 rounded-lg bg-primary text-white font-medium hover:bg-primary/90 transition-colors">
                {t("clearFilters")}
              </button>
            </div>
          ) : view === "grid" ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-5">
              {vehicles.map(v => <VehicleCard key={v.id} vehicle={v} />)}
            </div>
          ) : (
            <div className="space-y-4">
              {vehicles.map(v => <VehicleCardList key={v.id} vehicle={v} />)}
            </div>
          )}

          {/* Pagination Controls */}
          {totalPages > 1 && (
            <div className="flex justify-center items-center gap-2 mt-12">
              <button
                disabled={currentPage <= 1}
                onClick={() => {
                  const params = new URLSearchParams(searchParams.toString());
                  params.set("page", String(currentPage - 1));
                  router.push(`/vehicles?${params.toString()}`);
                }}
                className="h-10 px-4 rounded-lg border border-zinc-200 dark:border-zinc-800 disabled:opacity-50 hover:bg-zinc-50 dark:hover:bg-zinc-800 transition-colors"
              >
                {t("previous")}
              </button>
              
              <div className="flex items-center gap-1">
                {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                  <button
                    key={page}
                    onClick={() => {
                      const params = new URLSearchParams(searchParams.toString());
                      params.set("page", String(page));
                      router.push(`/vehicles?${params.toString()}`);
                    }}
                    className={cn(
                      "w-10 h-10 flex items-center justify-center rounded-lg text-sm font-medium transition-colors",
                      currentPage === page
                        ? "bg-primary text-white"
                        : "hover:bg-zinc-100 dark:hover:bg-zinc-800 text-zinc-600 dark:text-zinc-400"
                    )}
                  >
                    {page}
                  </button>
                ))}
              </div>

              <button
                disabled={currentPage >= totalPages}
                onClick={() => {
                  const params = new URLSearchParams(searchParams.toString());
                  params.set("page", String(currentPage + 1));
                  router.push(`/vehicles?${params.toString()}`);
                }}
                className="h-10 px-4 rounded-lg border border-zinc-200 dark:border-zinc-800 disabled:opacity-50 hover:bg-zinc-50 dark:hover:bg-zinc-800 transition-colors"
              >
                {t("next")}
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// ─── List view card ────────────────────────────────────────────────────────────
function VehicleCardList({ vehicle }: { vehicle: VehicleListing }) {
  const isLocal = vehicle.availability === "IN_CONGO";
  const t = useTranslations("Vehicles");
  const locale = useLocale();
  const isAdminOrSourced = Boolean(vehicle.source) || (vehicle.seller as any)?.role === "ADMIN" || (vehicle.seller as any)?.role === "SUPER_ADMIN" || vehicle.seller?.name === "Car Relais";
  return (
    <Link
      href={`/vehicles/${vehicle.slug}`}
      className="group flex flex-col sm:flex-row bg-white dark:bg-zinc-900 rounded-2xl border border-zinc-100 dark:border-zinc-800/50 hover:border-primary/40 shadow-xs hover:shadow-md transition-all overflow-hidden active:scale-[0.99]"
    >
      {/* Image */}
      <div className="relative w-full aspect-[4/3] sm:aspect-auto sm:w-52 shrink-0 bg-zinc-100 dark:bg-zinc-800 overflow-hidden">
        <Image src={vehicle.images[0]} alt={vehicle.title} fill className="object-cover group-hover:scale-105 transition-transform duration-500" sizes="(max-width: 640px) 100vw, 208px" />
        <div className="absolute top-2 left-2 z-10">
          <span
            className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold text-white shadow-md ${
              isLocal
                ? "bg-emerald-600 border border-emerald-500/40"
                : "bg-blue-600 border border-blue-500/40"
            }`}
          >
            {isLocal ? `✓ ${t("congoShort")}` : `🚢 ${t("importShort")}`}
          </span>
        </div>
      </div>

      {/* Info */}
      <div className="flex-1 p-5 flex flex-col justify-between min-w-0">
        <div>
          <div className="flex items-start justify-between gap-4 mb-2">
            <h3 className="font-semibold text-lg line-clamp-1">{vehicle.title}</h3>
            <span className="font-bold text-xl text-primary shrink-0">{formatPrice(vehicle.price)}</span>
          </div>
          <div className="flex flex-wrap gap-4 text-sm text-zinc-500 dark:text-zinc-400">
            <span className="flex items-center gap-1"><Calendar className="w-3.5 h-3.5" /> {vehicle.year}</span>
            <span className="flex items-center gap-1"><Settings className="w-3.5 h-3.5" /> {t(vehicle.transmission as any)}</span>
            <span className="flex items-center gap-1"><Fuel className="w-3.5 h-3.5" /> {t(vehicle.fuelType as any)}</span>
            {vehicle.mileage !== undefined && vehicle.mileage !== null && (
              <span>{vehicle.mileage.toLocaleString()} km</span>
            )}
            {vehicle.createdAt && (
              <span className="flex items-center gap-1 text-zinc-400">
                <Clock className="w-3.5 h-3.5" />
                {formatListingDate(vehicle.createdAt, locale)}
              </span>
            )}
          </div>
        </div>
        <div className="flex items-center justify-between mt-4 pt-4 border-t border-zinc-100 dark:border-zinc-800">
          <div className="flex items-center gap-1.5 text-sm text-zinc-600 dark:text-zinc-300">
            <MapPin className="w-4 h-4 text-zinc-400" />
            <span>{vehicle.location}</span>
          </div>
          <div className="flex items-center gap-1.5 text-sm">
            <span className="font-medium">
              {isAdminOrSourced ? "Car Relais" : vehicle.seller.name}
            </span>
            {(vehicle.seller.isVerified || isAdminOrSourced) && <CheckCircle2 className="w-4 h-4 text-primary" />}
          </div>
        </div>
      </div>
    </Link>
  );
}
