"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter, usePathname, useSearchParams } from "next/navigation";
import {
  BookOpen,
  Search,
  Sparkles,
  Filter,
  X,
  Compass,
  ArrowRight,
} from "lucide-react";
import { Article, ARTICLE_CATEGORIES, ArticleCategoryKey } from "@/types/article";
import ArticleCard from "./ArticleCard";
import ArticlePagination from "./ArticlePagination";

interface LearnLandingPageProps {
  articles: Article[];
  totalCount: number;
  currentPage: number;
  totalPages: number;
  locale: string;
  categoryCounts: Record<string, number>;
  selectedCategory?: string;
  searchQuery?: string;
}

export default function LearnLandingPage({
  articles,
  totalCount,
  currentPage,
  totalPages,
  locale,
  categoryCounts,
  selectedCategory = "all",
  searchQuery = "",
}: LearnLandingPageProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const isEn = locale === "en";
  const [searchTerm, setSearchTerm] = useState(searchQuery);

  const title = isEn ? "Learn" : "Apprendre";
  const subtitle = isEn
    ? "Expert automotive guides, car prices, maintenance advice, import tips, and vehicle market news in DRC."
    : "Guides automobiles, prix des véhicules, conseils d'entretien, importation et actualités du marché en RDC.";

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const params = new URLSearchParams(searchParams.toString());
    if (searchTerm.trim()) {
      params.set("q", searchTerm.trim());
    } else {
      params.delete("q");
    }
    params.delete("page");
    router.push(`${pathname}?${params.toString()}`);
  };

  const handleCategorySelect = (categoryKey: string) => {
    const params = new URLSearchParams(searchParams.toString());
    if (categoryKey === "all") {
      params.delete("category");
    } else {
      params.set("category", categoryKey);
    }
    params.delete("page");
    router.push(`${pathname}?${params.toString()}`);
  };

  const clearAllFilters = () => {
    setSearchTerm("");
    router.push(pathname);
  };

  const hasActiveFilters = Boolean(
    (selectedCategory && selectedCategory !== "all") || searchQuery
  );

  return (
    <div className="min-h-screen bg-zinc-50/60 dark:bg-zinc-950 pb-20">
      {/* Editorial Hero Header */}
      <section className="relative overflow-hidden bg-gradient-to-b from-primary/10 via-primary/5 to-transparent border-b border-zinc-200 dark:border-zinc-800/80 pt-12 pb-16 md:pt-16 md:pb-20">
        <div className="container mx-auto px-4 max-w-6xl relative z-10 text-center space-y-4">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-primary/15 text-primary text-xs font-bold tracking-wide uppercase">
            <Sparkles className="w-3.5 h-3.5" />
            <span>{isEn ? "Car Relais Editorial & Guides" : "Guides & Actualités Car Relais"}</span>
          </div>

          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black tracking-tight text-zinc-900 dark:text-zinc-50">
            {title}
          </h1>

          <p className="text-sm sm:text-base text-zinc-600 dark:text-zinc-300 max-w-2xl mx-auto leading-relaxed">
            {subtitle}
          </p>

          {/* Search bar inside Hero */}
          <div className="pt-4 max-w-xl mx-auto">
            <form onSubmit={handleSearchSubmit} className="relative flex items-center">
              <Search className="w-4 h-4 text-zinc-400 absolute left-4 pointer-events-none" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder={
                  isEn
                    ? "Search guides, prices, car models..."
                    : "Rechercher des guides, prix, modèles de véhicules..."
                }
                className="w-full pl-11 pr-24 py-3 text-sm rounded-2xl border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-900 text-zinc-900 dark:text-zinc-100 shadow-lg shadow-zinc-200/50 dark:shadow-none focus:outline-none focus:ring-2 focus:ring-primary transition-all"
              />
              <button
                type="submit"
                className="absolute right-2 px-4 py-1.5 rounded-xl bg-primary text-white text-xs font-bold hover:bg-primary/90 transition-colors cursor-pointer"
              >
                {isEn ? "Search" : "Rechercher"}
              </button>
            </form>
          </div>
        </div>
      </section>

      {/* Main Content Area */}
      <main className="container mx-auto px-4 max-w-6xl mt-8 space-y-8">
        {/* Category Pills Navigation */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-zinc-500">
              <Filter className="w-3.5 h-3.5" />
              <span>{isEn ? "Filter by topic" : "Filtrer par thématique"}</span>
            </div>

            {hasActiveFilters && (
              <button
                type="button"
                onClick={clearAllFilters}
                className="inline-flex items-center gap-1 text-xs font-semibold text-primary hover:underline cursor-pointer"
              >
                <X className="w-3.5 h-3.5" />
                <span>{isEn ? "Clear filters" : "Effacer les filtres"}</span>
              </button>
            )}
          </div>

          <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
            {/* All pill */}
            <button
              type="button"
              onClick={() => handleCategorySelect("all")}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all shrink-0 cursor-pointer ${
                selectedCategory === "all" || !selectedCategory
                  ? "bg-primary text-white shadow-md shadow-primary/20"
                  : "bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-zinc-700 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800"
              }`}
            >
              <span>{isEn ? "All Articles" : "Tous les articles"}</span>
            </button>

            {/* Structured categories */}
            {Object.values(ARTICLE_CATEGORIES).map((cat) => {
              const isSelected = selectedCategory === cat.key;
              const count = categoryCounts[cat.key];

              return (
                <button
                  key={cat.key}
                  type="button"
                  onClick={() => handleCategorySelect(cat.key)}
                  className={`inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-medium transition-all shrink-0 cursor-pointer ${
                    isSelected
                      ? "bg-primary text-white font-bold shadow-md shadow-primary/20"
                      : "bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-zinc-700 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800"
                  }`}
                >
                  <span>{isEn ? cat.labelEn : cat.labelFr}</span>
                  {typeof count === "number" && count > 0 && (
                    <span
                      className={`text-[10px] px-1.5 py-0.2 rounded-full ${
                        isSelected
                          ? "bg-white/20 text-white"
                          : "bg-zinc-100 dark:bg-zinc-800 text-zinc-500"
                      }`}
                    >
                      {count}
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        </div>

        {/* Articles Count / Active Filter Feedback */}
        {hasActiveFilters && (
          <div className="p-3.5 rounded-xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 flex items-center justify-between text-xs text-zinc-600 dark:text-zinc-400">
            <div>
              {isEn ? (
                <>
                  Showing <strong>{totalCount}</strong> articles for:{" "}
                  {selectedCategory !== "all" && (
                    <span className="font-semibold text-primary mr-2">
                      Category: {selectedCategory}
                    </span>
                  )}
                  {searchQuery && (
                    <span className="font-semibold text-primary">
                      &ldquo;{searchQuery}&rdquo;
                    </span>
                  )}
                </>
              ) : (
                <>
                  Affichage de <strong>{totalCount}</strong> articles pour :{" "}
                  {selectedCategory !== "all" && (
                    <span className="font-semibold text-primary mr-2">
                      Catégorie : {selectedCategory}
                    </span>
                  )}
                  {searchQuery && (
                    <span className="font-semibold text-primary">
                      &ldquo;{searchQuery}&rdquo;
                    </span>
                  )}
                </>
              )}
            </div>
            <button
              type="button"
              onClick={clearAllFilters}
              className="text-primary font-bold hover:underline"
            >
              {isEn ? "Reset" : "Réinitialiser"}
            </button>
          </div>
        )}

        {/* Articles Cards Grid */}
        {articles.length === 0 ? (
          /* Empty States */
          <div className="py-20 text-center bg-white dark:bg-zinc-900 rounded-3xl border border-zinc-200 dark:border-zinc-800 p-8 space-y-4 max-w-lg mx-auto shadow-xs">
            <div className="w-16 h-16 rounded-full bg-primary/10 text-primary flex items-center justify-center mx-auto">
              <Compass className="w-8 h-8" />
            </div>

            <div className="space-y-1.5">
              <h3 className="text-lg font-bold text-zinc-900 dark:text-zinc-100">
                {hasActiveFilters
                  ? isEn
                    ? "No articles found"
                    : "Aucun article trouvé"
                  : isEn
                  ? "No articles available yet"
                  : "Aucun article disponible pour le moment"}
              </h3>
              <p className="text-xs text-zinc-500 leading-relaxed">
                {hasActiveFilters
                  ? isEn
                    ? "Try adjusting your search terms or category filter to discover other automotive guides."
                    : "Essayez de modifier vos critères de recherche ou votre catégorie pour découvrir d'autres guides."
                  : isEn
                  ? "Our editorial team is currently drafting automotive guides and news for the DRC market. Check back soon!"
                  : "Notre rédaction prépare actuellement de nouveaux guides et actualités pour le marché congolais. Revenez très bientôt !"}
              </p>
            </div>

            {hasActiveFilters && (
              <button
                type="button"
                onClick={clearAllFilters}
                className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-primary text-white text-xs font-bold hover:bg-primary/90 transition-colors shadow-sm"
              >
                <span>{isEn ? "Show all articles" : "Voir tous les articles"}</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {articles.map((article) => (
              <ArticleCard key={article.id} article={article} locale={locale} />
            ))}
          </div>
        )}

        {/* Server-Side Pagination */}
        <ArticlePagination
          currentPage={currentPage}
          totalPages={totalPages}
          basePath={pathname}
          locale={locale}
        />
      </main>
    </div>
  );
}
