"use client";

import * as React from "react";
import { useRouter, usePathname, useSearchParams } from "next/navigation";
import { useTranslations } from "next-intl";
import { Search, RotateCcw, Filter } from "lucide-react";

interface ListingFiltersProps {
  initialSearch?: string;
  initialStatus?: string;
  initialSellerType?: string;
  initialDateRange?: string;
}

export default function ListingFilters({
  initialSearch = "",
  initialStatus = "",
  initialSellerType = "",
  initialDateRange = "",
}: ListingFiltersProps) {
  const t = useTranslations("AdminPortal.listings.filters");
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const [search, setSearch] = React.useState(initialSearch);
  const [status, setStatus] = React.useState(initialStatus);
  const [sellerType, setSellerType] = React.useState(initialSellerType);
  const [dateRange, setDateRange] = React.useState(initialDateRange);

  const applyFilters = (newParams: { q?: string; status?: string; sellerType?: string; date?: string }) => {
    const params = new URLSearchParams(searchParams.toString());
    
    // Reset page to 1 on filter changes
    params.delete("page");

    if (newParams.q !== undefined) {
      if (newParams.q.trim()) params.set("q", newParams.q.trim());
      else params.delete("q");
    }
    if (newParams.status !== undefined) {
      if (newParams.status) params.set("status", newParams.status);
      else params.delete("status");
    }
    if (newParams.sellerType !== undefined) {
      if (newParams.sellerType) params.set("sellerType", newParams.sellerType);
      else params.delete("sellerType");
    }
    if (newParams.date !== undefined) {
      if (newParams.date) params.set("date", newParams.date);
      else params.delete("date");
    }

    router.push(`${pathname}?${params.toString()}`);
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    applyFilters({ q: search });
  };

  const handleReset = () => {
    setSearch("");
    setStatus("");
    setSellerType("");
    setDateRange("");
    router.push(pathname);
  };

  const hasActiveFilters = Boolean(search || status || sellerType || dateRange);

  return (
    <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl p-4 shadow-xs space-y-4">
      <form onSubmit={handleSearchSubmit} className="flex flex-col md:flex-row gap-3">
        {/* Search input */}
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-zinc-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
          <input
            type="text"
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Rechercher par marque, modèle, vendeur ou ID..."
            className="w-full pl-10 pr-4 py-2 text-sm bg-zinc-50 dark:bg-zinc-800/50 border border-zinc-300 dark:border-zinc-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary text-zinc-900 dark:text-zinc-100 placeholder:text-zinc-400"
          />
        </div>

        <button
          type="submit"
          className="px-4 py-2 bg-primary hover:bg-primary/90 text-white rounded-xl text-sm font-medium transition-colors cursor-pointer shrink-0 shadow-xs"
        >
          Rechercher
        </button>
      </form>

      {/* Filter dropdowns */}
      <div className="flex flex-wrap items-center gap-3 pt-1 border-t border-zinc-100 dark:border-zinc-800/60">
        <div className="flex items-center gap-1.5 text-xs font-semibold text-zinc-500 uppercase tracking-wider">
          <Filter className="w-3.5 h-3.5" />
          <span>Filtres :</span>
        </div>

        {/* Status */}
        <select
          value={status}
          onChange={e => {
            setStatus(e.target.value);
            applyFilters({ status: e.target.value });
          }}
          className="px-3 py-1.5 text-xs bg-zinc-50 dark:bg-zinc-800 border border-zinc-300 dark:border-zinc-700 rounded-lg text-zinc-800 dark:text-zinc-200 focus:outline-none focus:ring-1 focus:ring-primary cursor-pointer"
        >
          <option value="">{t("allStatuses")}</option>
          <option value="PENDING_REVIEW">En attente (Modération)</option>
          <option value="PUBLISHED">Publiée (En ligne)</option>
          <option value="REJECTED">Rejetée</option>
          <option value="SOLD">Vendue</option>
          <option value="SUSPENDED">Suspendue</option>
          <option value="DRAFT">Brouillon</option>
        </select>

        {/* Seller Type */}
        <select
          value={sellerType}
          onChange={e => {
            setSellerType(e.target.value);
            applyFilters({ sellerType: e.target.value });
          }}
          className="px-3 py-1.5 text-xs bg-zinc-50 dark:bg-zinc-800 border border-zinc-300 dark:border-zinc-700 rounded-lg text-zinc-800 dark:text-zinc-200 focus:outline-none focus:ring-1 focus:ring-primary cursor-pointer"
        >
          <option value="">{t("allSellers")}</option>
          <option value="DEALERSHIP">{t("dealer")}</option>
          <option value="INDIVIDUAL">{t("individual")}</option>
        </select>

        {/* Date Range */}
        <select
          value={dateRange}
          onChange={e => {
            setDateRange(e.target.value);
            applyFilters({ date: e.target.value });
          }}
          className="px-3 py-1.5 text-xs bg-zinc-50 dark:bg-zinc-800 border border-zinc-300 dark:border-zinc-700 rounded-lg text-zinc-800 dark:text-zinc-200 focus:outline-none focus:ring-1 focus:ring-primary cursor-pointer"
        >
          <option value="">{t("allDates")}</option>
          <option value="today">{t("today")}</option>
          <option value="thisWeek">{t("thisWeek")}</option>
          <option value="thisMonth">{t("thisMonth")}</option>
        </select>

        {/* Reset */}
        {hasActiveFilters && (
          <button
            type="button"
            onClick={handleReset}
            className="ml-auto inline-flex items-center gap-1 px-3 py-1.5 text-xs text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-100 hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded-lg transition-colors cursor-pointer"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>{t("reset")}</span>
          </button>
        )}
      </div>
    </div>
  );
}
