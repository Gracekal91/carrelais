"use client";

import * as React from "react";
import { useRouter, usePathname, useSearchParams } from "next/navigation";
import { Search, RotateCcw, Filter } from "lucide-react";

interface DealerFiltersProps {
  initialSearch?: string;
  initialVerification?: string;
}

export default function DealerFilters({
  initialSearch = "",
  initialVerification = "",
}: DealerFiltersProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const [search, setSearch] = React.useState(initialSearch);
  const [verification, setVerification] = React.useState(initialVerification);

  const applyFilters = (newParams: { q?: string; verification?: string }) => {
    const params = new URLSearchParams(searchParams.toString());
    params.delete("page");

    if (newParams.q !== undefined) {
      if (newParams.q.trim()) params.set("q", newParams.q.trim());
      else params.delete("q");
    }
    if (newParams.verification !== undefined) {
      if (newParams.verification) params.set("verification", newParams.verification);
      else params.delete("verification");
    }

    router.push(`${pathname}?${params.toString()}`);
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    applyFilters({ q: search });
  };

  const handleReset = () => {
    setSearch("");
    setVerification("");
    router.push(pathname);
  };

  const hasActiveFilters = Boolean(search || verification);

  return (
    <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl p-4 shadow-xs space-y-4">
      <form onSubmit={handleSearchSubmit} className="flex flex-col md:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-zinc-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
          <input
            type="text"
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Rechercher un concessionnaire par nom, ville, contact..."
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

      <div className="flex flex-wrap items-center gap-3 pt-1 border-t border-zinc-100 dark:border-zinc-800/60">
        <div className="flex items-center gap-1.5 text-xs font-semibold text-zinc-500 uppercase tracking-wider">
          <Filter className="w-3.5 h-3.5" />
          <span>Filtres :</span>
        </div>

        <select
          value={verification}
          onChange={e => {
            setVerification(e.target.value);
            applyFilters({ verification: e.target.value });
          }}
          className="px-3 py-1.5 text-xs bg-zinc-50 dark:bg-zinc-800 border border-zinc-300 dark:border-zinc-700 rounded-lg text-zinc-800 dark:text-zinc-200 focus:outline-none focus:ring-1 focus:ring-primary cursor-pointer"
        >
          <option value="">Tous les concessionnaires</option>
          <option value="verifiedOnly">Vérifiés uniquement</option>
          <option value="unverifiedOnly">Non vérifiés uniquement</option>
        </select>

        {hasActiveFilters && (
          <button
            type="button"
            onClick={handleReset}
            className="ml-auto inline-flex items-center gap-1 px-3 py-1.5 text-xs text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-100 hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded-lg transition-colors cursor-pointer"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Réinitialiser</span>
          </button>
        )}
      </div>
    </div>
  );
}
