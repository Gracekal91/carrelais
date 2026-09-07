"use client";

import { useState, useMemo } from "react";
import { useSearchParams } from "next/navigation";
import { useRouter } from "@/i18n/routing";
import { cn } from "@/lib/utils";
import {
  SlidersHorizontal, X, ChevronDown, Check,
  ArrowUpDown, LayoutGrid, List, ChevronRight
} from "lucide-react";
import { Select } from "@/components/ui/Select";
import { MAKES_AND_MODELS, PRICE_OPTIONS_CASH, YEAR_OPTIONS } from "@/lib/search-constants";

// ─── Custom Radio ──────────────────────────────────────────────────────────────
function RadioOption({ label, value, selected, onChange }: {
  label: string; value: string; selected: boolean; onChange: (v: string) => void;
}) {
  return (
    <button
      type="button"
      onClick={() => onChange(value)}
      className="flex items-center gap-3 w-full py-2 group"
    >
      <span className={cn(
        "w-4 h-4 rounded-full border-2 flex items-center justify-center flex-shrink-0 transition-colors",
        selected
          ? "border-primary bg-primary"
          : "border-zinc-300 dark:border-zinc-600 group-hover:border-primary/60"
      )}>
        {selected && <span className="w-1.5 h-1.5 rounded-full bg-white" />}
      </span>
      <span className={cn("text-sm", selected ? "font-medium text-primary" : "text-zinc-700 dark:text-zinc-300")}>
        {label}
      </span>
    </button>
  );
}

// ─── Custom Checkbox ────────────────────────────────────────────────────────────
function CheckboxOption({ label, checked, onChange }: {
  label: string; checked: boolean; onChange: () => void;
}) {
  return (
    <button type="button" onClick={onChange} className="flex items-center gap-3 w-full py-2 group">
      <span className={cn(
        "w-4 h-4 rounded border-2 flex items-center justify-center flex-shrink-0 transition-colors",
        checked
          ? "border-primary bg-primary"
          : "border-zinc-300 dark:border-zinc-600 group-hover:border-primary/60"
      )}>
        {checked && <Check className="w-2.5 h-2.5 text-white stroke-[3]" />}
      </span>
      <span className={cn("text-sm", checked ? "font-medium text-primary" : "text-zinc-700 dark:text-zinc-300")}>
        {label}
      </span>
    </button>
  );
}

// ─── Collapsible Filter Section ─────────────────────────────────────────────────
function FilterSection({ title, children, defaultOpen = true }: {
  title: string; children: React.ReactNode; defaultOpen?: boolean;
}) {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <div className="border-b border-zinc-200 dark:border-zinc-800 py-4 last:border-0">
      <button
        type="button"
        onClick={() => setOpen(!open)}
        className="flex items-center justify-between w-full mb-1 group"
      >
        <span className="font-semibold text-sm text-zinc-900 dark:text-white">{title}</span>
        <ChevronDown className={cn(
          "w-4 h-4 text-zinc-400 transition-transform",
          open && "rotate-180"
        )} />
      </button>
      {open && <div className="mt-2">{children}</div>}
    </div>
  );
}

// ─── Types ──────────────────────────────────────────────────────────────────────
interface FilterState {
  make: string;
  model: string;
  minPrice: string;
  maxPrice: string;
  minYear: string;
  maxYear: string;
  availability: string;
  transmission: string[];
  fuelType: string[];
  condition: string;
}

const SORT_OPTIONS = [
  { value: "newest", label: "Newest First" },
  { value: "price_asc", label: "Price: Low to High" },
  { value: "price_desc", label: "Price: High to Low" },
  { value: "year_desc", label: "Year: Newest" },
  { value: "year_asc", label: "Year: Oldest" },
  { value: "mileage_asc", label: "Mileage: Lowest" },
];

const TRANSMISSION_OPTIONS = ["Automatic", "Manual"];
const FUEL_OPTIONS = ["Petrol", "Diesel", "Hybrid", "Electric"];
const CONDITION_OPTIONS = [
  { value: "", label: "Any" },
  { value: "New", label: "New" },
  { value: "Used", label: "Used" },
];

export function VehiclesFilterPanel({ totalCount }: { totalCount: number }) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [mobileOpen, setMobileOpen] = useState(false);

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

  const [sort, setSort] = useState(searchParams.get("sort") || "newest");
  const [view, setView] = useState<"grid" | "list">("grid");

  const makeModels = useMemo(() => {
    const found = MAKES_AND_MODELS.find(m => m.make === filters.make);
    return found?.models.map(m => ({ value: m.name, label: m.name })) || [];
  }, [filters.make]);

  const makeOptions = [
    { value: "", label: "All Makes" },
    ...MAKES_AND_MODELS.map(m => ({ value: m.make, label: m.make })),
  ];

  const modelOptions = [
    { value: "", label: "All Models" },
    ...makeModels,
  ];

  const setFilter = <K extends keyof FilterState>(key: K, value: FilterState[K]) => {
    setFilters(prev => ({ ...prev, [key]: value }));
  };

  const toggleMulti = (key: "transmission" | "fuelType", val: string) => {
    setFilters(prev => ({
      ...prev,
      [key]: prev[key].includes(val)
        ? (prev[key] as string[]).filter(v => v !== val)
        : [...(prev[key] as string[]), val],
    }));
  };

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
    if (sort) params.set("sort", sort);
    router.push(`/vehicles?${params.toString()}`);
    setMobileOpen(false);
  };

  const clearFilters = () => {
    setFilters({
      make: "", model: "", minPrice: "", maxPrice: "",
      minYear: "", maxYear: "", availability: "",
      transmission: [], fuelType: [], condition: "",
    });
    router.push("/vehicles");
    setMobileOpen(false);
  };

  const activeFilterCount = [
    filters.make, filters.availability, filters.condition,
    ...filters.transmission, ...filters.fuelType,
    filters.minPrice, filters.maxPrice, filters.minYear, filters.maxYear,
  ].filter(Boolean).length;

  const FilterBody = (
    <div>
      <FilterSection title="Availability">
        {["", "IN_CONGO", "IMPORT"].map((v, i) => (
          <RadioOption
            key={v}
            value={v}
            label={["Any", "Available in Congo", "Available for Import"][i]}
            selected={filters.availability === v}
            onChange={val => setFilter("availability", val)}
          />
        ))}
      </FilterSection>

      <FilterSection title="Make & Model">
        <div className="space-y-3">
          <Select
            value={filters.make}
            onChange={val => { setFilter("make", val); setFilter("model", ""); }}
            options={makeOptions}
            placeholder="All Makes"
          />
          {filters.make && (
            <Select
              value={filters.model}
              onChange={val => setFilter("model", val)}
              options={modelOptions}
              placeholder="All Models"
            />
          )}
        </div>
      </FilterSection>

      <FilterSection title="Price Range (USD)">
        <div className="grid grid-cols-2 gap-2">
          <Select
            value={filters.minPrice}
            onChange={val => {
              setFilter("minPrice", val);
              if (filters.maxPrice && Number(val) >= Number(filters.maxPrice)) setFilter("maxPrice", "");
            }}
            options={PRICE_OPTIONS_CASH.filter(o => !filters.maxPrice || Number(o.value) < Number(filters.maxPrice))}
            placeholder="Min"
          />
          <Select
            value={filters.maxPrice}
            onChange={val => {
              setFilter("maxPrice", val);
              if (filters.minPrice && Number(val) <= Number(filters.minPrice)) setFilter("minPrice", "");
            }}
            options={PRICE_OPTIONS_CASH.filter(o => !filters.minPrice || Number(o.value) > Number(filters.minPrice))}
            placeholder="Max"
          />
        </div>
      </FilterSection>

      <FilterSection title="Year Range">
        <div className="grid grid-cols-2 gap-2">
          <Select
            value={filters.minYear}
            onChange={val => {
              setFilter("minYear", val);
              if (filters.maxYear && Number(val) >= Number(filters.maxYear)) setFilter("maxYear", "");
            }}
            options={YEAR_OPTIONS.filter(o => !filters.maxYear || Number(o.value) < Number(filters.maxYear))}
            placeholder="From"
          />
          <Select
            value={filters.maxYear}
            onChange={val => {
              setFilter("maxYear", val);
              if (filters.minYear && Number(val) <= Number(filters.minYear)) setFilter("minYear", "");
            }}
            options={YEAR_OPTIONS.filter(o => !filters.minYear || Number(o.value) > Number(filters.minYear))}
            placeholder="To"
          />
        </div>
      </FilterSection>

      <FilterSection title="Transmission">
        {TRANSMISSION_OPTIONS.map(t => (
          <CheckboxOption
            key={t}
            label={t}
            checked={filters.transmission.includes(t)}
            onChange={() => toggleMulti("transmission", t)}
          />
        ))}
      </FilterSection>

      <FilterSection title="Fuel Type">
        {FUEL_OPTIONS.map(f => (
          <CheckboxOption
            key={f}
            label={f}
            checked={filters.fuelType.includes(f)}
            onChange={() => toggleMulti("fuelType", f)}
          />
        ))}
      </FilterSection>

      <FilterSection title="Condition" defaultOpen={false}>
        {CONDITION_OPTIONS.map(c => (
          <RadioOption
            key={c.value}
            value={c.value}
            label={c.label}
            selected={filters.condition === c.value}
            onChange={val => setFilter("condition", val)}
          />
        ))}
      </FilterSection>

      <div className="flex gap-2 pt-4">
        <button
          type="button"
          onClick={clearFilters}
          className="flex-1 h-10 rounded-lg border border-zinc-300 dark:border-zinc-700 text-sm font-medium text-zinc-700 dark:text-zinc-300 hover:bg-zinc-50 dark:hover:bg-zinc-800 transition-colors"
        >
          Clear All
        </button>
        <button
          type="button"
          onClick={applyFilters}
          className="flex-1 h-10 rounded-lg bg-primary text-white text-sm font-semibold hover:bg-primary/90 transition-colors"
        >
          Apply Filters
        </button>
      </div>
    </div>
  );

  return (
    <>
      {/* ── Toolbar (sort + view toggle + mobile filter trigger) ── */}
      <div className="flex items-center justify-between gap-4 mb-6">
        <div className="flex items-center gap-2">
          {/* Mobile filter button */}
          <button
            type="button"
            onClick={() => setMobileOpen(true)}
            className="lg:hidden flex items-center gap-2 h-10 px-4 rounded-lg border border-zinc-300 dark:border-zinc-700 text-sm font-medium text-zinc-700 dark:text-zinc-300 hover:bg-zinc-50 dark:hover:bg-zinc-800 transition-colors"
          >
            <SlidersHorizontal className="w-4 h-4" />
            Filters
            {activeFilterCount > 0 && (
              <span className="ml-1 w-5 h-5 rounded-full bg-primary text-white text-xs flex items-center justify-center">
                {activeFilterCount}
              </span>
            )}
          </button>

          <p className="text-sm text-zinc-500 dark:text-zinc-400">
            <span className="font-semibold text-zinc-900 dark:text-white">{totalCount}</span> results
          </p>
        </div>

        <div className="flex items-center gap-2">
          {/* Sort dropdown */}
          <div className="w-52">
            <Select
              value={sort}
              onChange={val => { setSort(val); }}
              options={SORT_OPTIONS}
              placeholder="Sort by"
            />
          </div>

          {/* View toggle */}
          <div className="flex border border-zinc-300 dark:border-zinc-700 rounded-lg overflow-hidden">
            <button
              type="button"
              onClick={() => setView("grid")}
              className={cn(
                "h-9 w-9 flex items-center justify-center transition-colors",
                view === "grid"
                  ? "bg-primary text-white"
                  : "text-zinc-500 hover:bg-zinc-100 dark:hover:bg-zinc-800"
              )}
            >
              <LayoutGrid className="w-4 h-4" />
            </button>
            <button
              type="button"
              onClick={() => setView("list")}
              className={cn(
                "h-9 w-9 flex items-center justify-center transition-colors",
                view === "list"
                  ? "bg-primary text-white"
                  : "text-zinc-500 hover:bg-zinc-100 dark:hover:bg-zinc-800"
              )}
            >
              <List className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      <div className="flex gap-8 items-start">
        {/* ── Desktop sidebar ── */}
        <aside className="hidden lg:block w-64 shrink-0 sticky top-20 max-h-[calc(100vh-6rem)] overflow-y-auto bg-white dark:bg-zinc-900 rounded-xl border border-zinc-200 dark:border-zinc-800 p-4">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-bold text-zinc-900 dark:text-white">Filters</h2>
            {activeFilterCount > 0 && (
              <button
                type="button"
                onClick={clearFilters}
                className="text-xs text-primary hover:underline"
              >
                Clear ({activeFilterCount})
              </button>
            )}
          </div>
          {FilterBody}
        </aside>

        {/* ── Mobile slide-over ── */}
        {mobileOpen && (
          <div className="fixed inset-0 z-[200] lg:hidden flex">
            <div
              className="fixed inset-0 bg-black/50 backdrop-blur-sm"
              onClick={() => setMobileOpen(false)}
            />
            <div className="relative ml-auto h-full w-[85%] max-w-sm bg-white dark:bg-zinc-900 p-5 shadow-2xl flex flex-col overflow-y-auto">
              <div className="flex items-center justify-between mb-5">
                <h2 className="font-bold text-lg">Filters</h2>
                <button
                  type="button"
                  onClick={() => setMobileOpen(false)}
                  className="p-2 rounded-full hover:bg-zinc-100 dark:hover:bg-zinc-800"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
              {FilterBody}
            </div>
          </div>
        )}

        {/* ── Results area (slot) — rendered by parent ── */}
        <div className="flex-1 min-w-0" data-view={view} id="vehicles-results-slot" />
      </div>
    </>
  );
}
