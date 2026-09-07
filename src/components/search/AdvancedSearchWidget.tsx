"use client";

import React, { useState, useEffect, useRef } from "react";
import { Search, History, RefreshCw, ChevronDown, CheckCircle2, Circle } from "lucide-react";
import { useRouter } from "@/i18n/routing";
import { cn } from "@/lib/utils";

import { PROVINCES, MAKES_AND_MODELS, PRICE_OPTIONS_CASH, YEAR_OPTIONS } from "@/lib/search-constants";
import { Select } from "@/components/ui/Select";
import { useTranslations } from "next-intl";

type ActiveDropdown = "make" | "province" | null;

// Build filtered option lists ensuring min < max constraint
function getMaxOptions(options: { value: string; label: string }[], minVal: string) {
  if (!minVal) return options;
  return options.filter((o) => Number(o.value) > Number(minVal));
}

function getMinOptions(options: { value: string; label: string }[], maxVal: string) {
  if (!maxVal) return options;
  return options.filter((o) => Number(o.value) < Number(maxVal));
}

export function AdvancedSearchWidget() {
  const router = useRouter();
  const t = useTranslations("SearchHero");
  const tVehicles = useTranslations("Vehicles");

  // State
  const [searchQuery, setSearchQuery] = useState("");
  const [activeDropdown, setActiveDropdown] = useState<ActiveDropdown>(null);

  const [selectedMake, setSelectedMake] = useState<string>("");
  const [selectedModel, setSelectedModel] = useState<string>("");
  const [expandedMake, setExpandedMake] = useState<string | null>(null);

  const [selectedProvince, setSelectedProvince] = useState<string>("");

  const [minPrice, setMinPrice] = useState("");
  const [maxPrice, setMaxPrice] = useState("");
  const [minYear, setMinYear] = useState("");
  const [maxYear, setMaxYear] = useState("");

  const [activeTab, setActiveTab] = useState("Sponsored cars");

  const containerRef = useRef<HTMLDivElement>(null);

  // Total items logic
  const totalInventory = 4987; // Base dummy total

  // Close dropdown on click outside
  useEffect(() => {
    const handleOutsideClick = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setActiveDropdown(null);
      }
    };
    document.addEventListener("mousedown", handleOutsideClick);
    return () => document.removeEventListener("mousedown", handleOutsideClick);
  }, []);

  // Calculate results purely as derived state (memoized for performance)
  const resultsCount = React.useMemo(() => {
    let count = totalInventory;
    if (selectedProvince) {
      const p = PROVINCES.find((p) => p.name === selectedProvince);
      if (p) count = p.count;
    }
    if (selectedMake) {
      const m = MAKES_AND_MODELS.find((m) => m.make === selectedMake);
      if (m) {
        if (selectedModel) {
          const mod = m.models.find((md) => md.name === selectedModel);
          if (mod) count = Math.min(count, mod.count);
        } else {
          count = Math.min(count, m.count);
        }
      }
    }
    if (minPrice || maxPrice || minYear || maxYear || searchQuery) {
      count = Math.max(0, Math.floor(count * 0.4)); // Just a visual dummy reduction
    }
    return count;
  }, [totalInventory, selectedProvince, selectedMake, selectedModel, minPrice, maxPrice, minYear, maxYear, searchQuery]);

  const handleReset = () => {
    setSearchQuery("");
    setSelectedMake("");
    setSelectedModel("");
    setExpandedMake(null);
    setSelectedProvince("");
    setActiveDropdown(null);
    setMinPrice("");
    setMaxPrice("");
    setMinYear("");
    setMaxYear("");
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const params = new URLSearchParams();
    if (searchQuery) params.set("q", searchQuery);
    if (selectedMake) params.set("make", selectedMake);
    if (selectedModel) params.set("model", selectedModel);
    if (selectedProvince) params.set("province", selectedProvince);
    if (minPrice) params.set("minPrice", minPrice);
    if (maxPrice) params.set("maxPrice", maxPrice);

    router.push(`/vehicles?${params.toString()}`);
  };

  const toggleDropdown = (type: ActiveDropdown) => {
    if (activeDropdown === type) {
      setActiveDropdown(null);
    } else {
      setActiveDropdown(type);
    }
  };



  return (
    <div className="w-full max-w-4xl mx-auto bg-white dark:bg-zinc-900 rounded-2xl shadow-xl border border-zinc-200 dark:border-zinc-800" ref={containerRef}>

      {/* Header */}
      <div className="px-6 py-8 text-center bg-zinc-50 dark:bg-zinc-950/50 border-b border-zinc-200 dark:border-zinc-800 rounded-t-2xl">
        <h1 className="text-3xl font-bold text-zinc-900 dark:text-white mb-2">{t("title")}</h1>
        <p className="text-zinc-600 dark:text-zinc-400">{t("subtitle")}</p>
      </div>

      <div className="p-6">
        <form onSubmit={handleSubmit} className="space-y-4">

          {/* Search Bar (Top) */}
          <div className="relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-zinc-400" />
            <input
              type="text"
              placeholder={t("placeholder")}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full h-14 pl-12 pr-12 bg-white dark:bg-zinc-900 border border-zinc-300 dark:border-zinc-700 rounded-xl focus:ring-2 focus:ring-primary focus:border-primary outline-none text-lg placeholder:text-zinc-400"
            />
            <button type="button" className="absolute right-4 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200 transition-colors">
              <History className="w-5 h-5" />
            </button>
          </div>

          {/* Filter Row 1 */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">

            {/* Makes & Models Dropdown */}
            <div className="relative">
              <button
                type="button"
                onClick={() => toggleDropdown("make")}
                className="w-full h-12 flex items-center justify-between px-4 bg-white dark:bg-zinc-900 border border-zinc-300 dark:border-zinc-700 rounded-lg hover:bg-zinc-50 dark:hover:bg-zinc-800 transition-colors"
              >
                <span className="truncate">
                  {selectedMake ? `${selectedMake} ${selectedModel ? `> ${selectedModel}` : ''}` : t("allMakesModels")}
                </span>
                <ChevronDown className={cn("w-5 h-5 text-zinc-400 transition-transform", activeDropdown === "make" && "rotate-180")} />
              </button>

              {activeDropdown === "make" && (
                <div className="absolute top-full left-0 w-[calc(100vw-3rem)] md:w-[600px] mt-2 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl shadow-2xl z-[100] flex h-[400px] overflow-hidden">
                  <div className="w-1/2 overflow-y-auto border-r border-zinc-100 dark:border-zinc-800 py-2">
                    <div
                      className="px-4 py-3 hover:bg-zinc-50 dark:hover:bg-zinc-800 cursor-pointer flex items-center justify-between"
                      onClick={() => {
                        setSelectedMake("");
                        setSelectedModel("");
                        setActiveDropdown(null);
                      }}
                    >
                      <div className="flex items-center gap-3">
                        {!selectedMake ? <CheckCircle2 className="w-5 h-5 text-primary" /> : <Circle className="w-5 h-5 text-zinc-300" />}
                        <span className="font-medium">{t("allMakes")}</span>
                      </div>
                      <span className="text-sm text-zinc-500">({totalInventory})</span>
                    </div>
                    {MAKES_AND_MODELS.map((m) => (
                      <div
                        key={m.make}
                        onMouseEnter={() => setExpandedMake(m.make)}
                        onClick={() => {
                          setSelectedMake(m.make);
                          setSelectedModel("");
                          if (!m.models.length) setActiveDropdown(null);
                        }}
                        className={cn(
                          "px-4 py-3 hover:bg-zinc-50 dark:hover:bg-zinc-800 cursor-pointer flex items-center justify-between",
                          expandedMake === m.make && "bg-zinc-50 dark:bg-zinc-800"
                        )}
                      >
                        <div className="flex items-center gap-3">
                          {selectedMake === m.make && !selectedModel ? <CheckCircle2 className="w-5 h-5 text-primary" /> : <Circle className="w-5 h-5 text-zinc-300" />}
                          <span className={selectedMake === m.make ? "font-semibold" : ""}>{m.make}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="text-sm text-zinc-500">({m.count})</span>
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Nested Models Column */}
                  <div className="w-1/2 overflow-y-auto bg-zinc-50 dark:bg-zinc-900/50 py-2">
                    {expandedMake ? (
                      <>
                        <div
                          className="px-4 py-3 hover:bg-zinc-100 dark:hover:bg-zinc-800 cursor-pointer flex items-center justify-between"
                          onClick={() => {
                            setSelectedMake(expandedMake);
                            setSelectedModel("");
                            setActiveDropdown(null);
                          }}
                        >
                          <div className="flex items-center gap-3">
                            {selectedMake === expandedMake && !selectedModel ? <CheckCircle2 className="w-5 h-5 text-primary" /> : <Circle className="w-5 h-5 text-zinc-300" />}
                            <span className="font-medium">{t("all")} {expandedMake}</span>
                          </div>
                        </div>
                        {MAKES_AND_MODELS.find(m => m.make === expandedMake)?.models.map((mod) => (
                          <div
                            key={mod.name}
                            onClick={() => {
                              setSelectedMake(expandedMake);
                              setSelectedModel(mod.name);
                              setActiveDropdown(null);
                            }}
                            className="px-4 py-3 hover:bg-zinc-100 dark:hover:bg-zinc-800 cursor-pointer flex items-center justify-between"
                          >
                            <div className="flex items-center gap-3">
                              {selectedMake === expandedMake && selectedModel === mod.name ? <CheckCircle2 className="w-5 h-5 text-primary" /> : <Circle className="w-5 h-5 text-zinc-300" />}
                              <span>{mod.name}</span>
                            </div>
                            <span className="text-sm text-zinc-500">({mod.count})</span>
                          </div>
                        ))}
                      </>
                    ) : (
                      <div className="h-full flex items-center justify-center text-zinc-400 text-sm px-6 text-center">
                        {t("hoverMake")}
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* Province Dropdown */}
            <div className="relative">
              <button
                type="button"
                onClick={() => toggleDropdown("province")}
                className="w-full h-12 flex items-center justify-between px-4 bg-white dark:bg-zinc-900 border border-zinc-300 dark:border-zinc-700 rounded-lg hover:bg-zinc-50 dark:hover:bg-zinc-800 transition-colors"
              >
                <span className="truncate">
                  {selectedProvince ? PROVINCES.find(p => p.name === selectedProvince)?.name : t("allProvinces")}
                </span>
                <ChevronDown className={cn("w-5 h-5 text-zinc-400 transition-transform", activeDropdown === "province" && "rotate-180")} />
              </button>

              {activeDropdown === "province" && (
                <div className="absolute top-full right-0 w-[calc(100vw-3rem)] md:w-[400px] mt-2 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl shadow-2xl z-[100] max-h-[400px] overflow-y-auto py-2">
                  <div
                    onClick={() => {
                      setSelectedProvince("");
                      setActiveDropdown(null);
                    }}
                    className={cn(
                      "px-4 py-3 hover:bg-zinc-50 dark:hover:bg-zinc-800 cursor-pointer flex items-center justify-between",
                      !selectedProvince && "bg-zinc-50 dark:bg-zinc-800"
                    )}
                  >
                    <span className="font-semibold text-zinc-900 dark:text-white">{t("all")}</span>
                    <span className="text-sm font-medium text-zinc-500">({totalInventory})</span>
                  </div>
                  {PROVINCES.map((prov) => (
                    <div
                      key={prov.name}
                      onClick={() => {
                        setSelectedProvince(prov.name);
                        setActiveDropdown(null);
                      }}
                      className={cn(
                        "px-4 py-3 hover:bg-zinc-50 dark:hover:bg-zinc-800 cursor-pointer flex items-center justify-between",
                        selectedProvince === prov.name && "bg-zinc-50 dark:bg-zinc-800 text-primary font-medium"
                      )}
                    >
                      <span>{prov.name}</span>
                      <span className="text-sm text-zinc-500">({prov.count})</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Filter Row 2: Price & Year Range */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-1">
              <p className="text-xs font-medium text-zinc-500 dark:text-zinc-400 px-1">{tVehicles("priceRange")}</p>
              <div className="grid grid-cols-2 gap-2">
                <Select
                  value={minPrice}
                  onChange={(val) => {
                    setMinPrice(val);
                    // Clear maxPrice if it's now invalid
                    if (maxPrice && Number(val) >= Number(maxPrice)) setMaxPrice("");
                  }}
                  options={getMinOptions(PRICE_OPTIONS_CASH, maxPrice)}
                  placeholder={tVehicles("min")}
                />
                <Select
                  value={maxPrice}
                  onChange={(val) => {
                    setMaxPrice(val);
                    if (minPrice && Number(val) <= Number(minPrice)) setMinPrice("");
                  }}
                  options={getMaxOptions(PRICE_OPTIONS_CASH, minPrice)}
                  placeholder={tVehicles("max")}
                />
              </div>
            </div>
            <div className="space-y-1">
              <p className="text-xs font-medium text-zinc-500 dark:text-zinc-400 px-1">{tVehicles("yearRange")}</p>
              <div className="grid grid-cols-2 gap-2">
                <Select
                  value={minYear}
                  onChange={(val) => {
                    setMinYear(val);
                    if (maxYear && Number(val) >= Number(maxYear)) setMaxYear("");
                  }}
                  options={getMinOptions(YEAR_OPTIONS, maxYear)}
                  placeholder={tVehicles("from")}
                />
                <Select
                  value={maxYear}
                  onChange={(val) => {
                    setMaxYear(val);
                    if (minYear && Number(val) <= Number(minYear)) setMinYear("");
                  }}
                  options={getMaxOptions(YEAR_OPTIONS, minYear)}
                  placeholder={tVehicles("to")}
                />
              </div>
            </div>
          </div>

          {/* Filter Row 4: Actions */}
          <div className="flex flex-col sm:flex-row items-center gap-4 pt-2">
            <button
              type="button"
              onClick={handleReset}
              className="flex items-center justify-center gap-2 px-6 h-12 rounded-xl border-2 border-primary/20 dark:border-primary/30 text-primary hover:bg-primary/10 dark:hover:bg-primary/20 font-bold transition-colors shrink-0 w-full sm:w-auto"
            >
              <RefreshCw className="w-4 h-4" />
              {t("reset")}
            </button>
            <button
              type="submit"
              className="flex-1 h-12 rounded-xl bg-primary hover:bg-primary/90 text-white font-bold text-lg transition-colors w-full flex items-center justify-center gap-2 shadow-lg shadow-primary/20"
            >
              {t("search", { count: resultsCount.toLocaleString() })}
            </button>
          </div>
        </form>
      </div>

      {/* Bottom Navigation Tabs */}
    </div>
  );
}
