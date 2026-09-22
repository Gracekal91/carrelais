"use client";

import React, { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter, usePathname, useSearchParams } from "next/navigation";
import {
  Plus,
  Search,
  Edit,
  Eye,
  Trash2,
  Globe,
  CheckCircle2,
  Clock,
  FileText,
  Filter,
  ExternalLink,
  Power,
  RotateCcw,
} from "lucide-react";
import { Article, ARTICLE_CATEGORIES, ArticleCategoryKey } from "@/types/article";
import DeleteArticleModal from "./DeleteArticleModal";
import PaginationControls from "@/components/admin/PaginationControls";
import { setArticleStatusAction } from "@/lib/article-actions";

interface ArticlesTableClientProps {
  articles: Article[];
  totalCount: number;
  currentPage: number;
  totalPages: number;
  pageSize: number;
}

export default function ArticlesTableClient({
  articles,
  totalCount,
  currentPage,
  totalPages,
  pageSize,
}: ArticlesTableClientProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const [items, setItems] = useState<Article[]>(articles);
  const [currentTotal, setCurrentTotal] = useState(totalCount);

  React.useEffect(() => {
    setItems(articles);
    setCurrentTotal(totalCount);
  }, [articles, totalCount]);

  // Search and filter state synced with URL searchParams
  const [searchTerm, setSearchTerm] = useState(searchParams.get("search") || "");
  const currentStatus = searchParams.get("status") || "ALL";
  const currentLanguage = searchParams.get("language") || "ALL";
  const currentCategory = searchParams.get("category") || "ALL";

  // Modal state
  const [articleToDelete, setArticleToDelete] = useState<{ id: string; title: string } | null>(
    null
  );
  const [togglingId, setTogglingId] = useState<string | null>(null);

  const updateFilters = (newParams: Record<string, string>) => {
    const params = new URLSearchParams(searchParams.toString());
    Object.entries(newParams).forEach(([key, val]) => {
      if (!val || val === "ALL") {
        params.delete(key);
      } else {
        params.set(key, val);
      }
    });
    params.delete("page"); // reset to page 1 on filter
    router.push(`${pathname}?${params.toString()}`);
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    updateFilters({ search: searchTerm.trim() });
  };

  const handleQuickStatusToggle = async (article: Article) => {
    try {
      setTogglingId(article.id);
      const nextStatus = article.status === "PUBLISHED" ? "UNPUBLISHED" : "PUBLISHED";
      setItems((prev) =>
        prev.map((a) => (a.id === article.id ? { ...a, status: nextStatus } : a))
      );
      await setArticleStatusAction(article.id, nextStatus);
      router.refresh();
    } catch (err: any) {
      alert("Erreur: " + (err.message || "Échec"));
      router.refresh();
    } finally {
      setTogglingId(null);
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Action Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-zinc-900 dark:text-zinc-100 tracking-tight">
            Articles &amp; Contenus (CMS)
          </h1>
          <p className="text-xs text-zinc-500 mt-1">
            Gérez les guides, prix des véhicules, conseils et actualités de la section Learn / Apprendre.
          </p>
        </div>

        <Link
          href="/admin/articles/create"
          className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-primary text-white font-bold text-xs hover:bg-primary/90 transition-all shadow-md shadow-primary/20 shrink-0"
        >
          <Plus className="w-4 h-4" />
          <span>Créer un article</span>
        </Link>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white dark:bg-zinc-900 p-4 rounded-2xl border border-zinc-200 dark:border-zinc-800 shadow-xs flex flex-col md:flex-row items-center gap-3">
        {/* Search Input */}
        <form onSubmit={handleSearchSubmit} className="relative flex-1 w-full">
          <Search className="w-4 h-4 text-zinc-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Rechercher par titre, slug, mots-clés, auteur..."
            className="w-full pl-9 pr-4 py-2 text-xs rounded-xl border border-zinc-200 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 focus:outline-none focus:ring-2 focus:ring-primary"
          />
        </form>

        {/* Language Filter */}
        <div className="flex items-center gap-2 w-full md:w-auto">
          <select
            value={currentLanguage}
            onChange={(e) => updateFilters({ language: e.target.value })}
            className="px-3 py-2 text-xs rounded-xl border border-zinc-200 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800 text-zinc-800 dark:text-zinc-200 focus:outline-none focus:ring-2 focus:ring-primary"
          >
            <option value="ALL">Toutes les langues</option>
            <option value="fr">🇫🇷 Français (fr)</option>
            <option value="en">🇬🇧 English (en)</option>
          </select>

          {/* Status Filter */}
          <select
            value={currentStatus}
            onChange={(e) => updateFilters({ status: e.target.value })}
            className="px-3 py-2 text-xs rounded-xl border border-zinc-200 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800 text-zinc-800 dark:text-zinc-200 focus:outline-none focus:ring-2 focus:ring-primary"
          >
            <option value="ALL">Tous les statuts</option>
            <option value="PUBLISHED">Publié (Public)</option>
            <option value="DRAFT">Brouillon (Draft)</option>
            <option value="UNPUBLISHED">Dépublié (Masqué)</option>
          </select>

          {/* Category Filter */}
          <select
            value={currentCategory}
            onChange={(e) => updateFilters({ category: e.target.value })}
            className="px-3 py-2 text-xs rounded-xl border border-zinc-200 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800 text-zinc-800 dark:text-zinc-200 focus:outline-none focus:ring-2 focus:ring-primary"
          >
            <option value="ALL">Toutes catégories</option>
            {Object.values(ARTICLE_CATEGORIES).map((cat) => (
              <option key={cat.key} value={cat.key}>
                {cat.labelFr}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Articles Table */}
      <div className="bg-white dark:bg-zinc-900 rounded-2xl border border-zinc-200 dark:border-zinc-800 overflow-hidden shadow-xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="border-b border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-800/50 text-zinc-500 uppercase tracking-wider font-semibold">
                <th className="py-3 px-4">Article</th>
                <th className="py-3 px-4">Langue</th>
                <th className="py-3 px-4">Catégorie</th>
                <th className="py-3 px-4">Statut</th>
                <th className="py-3 px-4">Auteur</th>
                <th className="py-3 px-4">Date</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-200 dark:divide-zinc-800 text-zinc-700 dark:text-zinc-300">
              {items.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-zinc-500">
                    <FileText className="w-8 h-8 text-zinc-300 dark:text-zinc-700 mx-auto mb-2" />
                    <p className="font-semibold">Aucun article trouvé</p>
                    <p className="text-[11px] text-zinc-400 mt-0.5">
                      Essayez de modifier vos filtres ou créez votre premier article.
                    </p>
                  </td>
                </tr>
              ) : (
                items.map((art) => {
                  const categoryConfig = ARTICLE_CATEGORIES[art.category] || ARTICLE_CATEGORIES.other;
                  const publicUrl =
                    art.language === "en"
                      ? `/en/learn/${art.slug}`
                      : `/fr/apprendre/${art.slug}`;

                  return (
                    <tr
                      key={art.id}
                      className="hover:bg-zinc-50 dark:hover:bg-zinc-800/50 transition-colors"
                    >
                      {/* Article Title & Thumbnail */}
                      <td className="py-3.5 px-4 max-w-sm">
                        <div className="flex items-center gap-3">
                          <div className="w-12 h-12 rounded-lg bg-zinc-100 dark:bg-zinc-800 overflow-hidden relative shrink-0 border border-zinc-200 dark:border-zinc-700">
                            {art.featuredImage ? (
                              <Image
                                src={art.featuredImage}
                                alt={art.title}
                                fill
                                className="object-cover"
                              />
                            ) : (
                              <div className="w-full h-full flex items-center justify-center text-zinc-400">
                                <FileText className="w-5 h-5" />
                              </div>
                            )}
                          </div>
                          <div className="min-w-0">
                            <Link
                              href={`/admin/articles/${art.id}/edit`}
                              className="font-bold text-zinc-900 dark:text-zinc-100 hover:text-primary transition-colors line-clamp-1 text-sm block"
                            >
                              {art.title}
                            </Link>
                            <span className="text-[11px] text-zinc-400 font-mono block truncate">
                              /{art.language === "en" ? "en/learn" : "fr/apprendre"}/{art.slug}
                            </span>
                            {art.translationId && (
                              <span className="inline-flex items-center gap-1 text-[10px] text-primary font-medium mt-0.5">
                                <Globe className="w-3 h-3" />
                                <span>Traduction liée</span>
                              </span>
                            )}
                          </div>
                        </div>
                      </td>

                      {/* Language */}
                      <td className="py-3.5 px-4 whitespace-nowrap">
                        <span
                          className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold ${
                            art.language === "en"
                              ? "bg-purple-100 text-purple-800 dark:bg-purple-900/40 dark:text-purple-300"
                              : "bg-blue-100 text-blue-800 dark:bg-blue-900/40 dark:text-blue-300"
                          }`}
                        >
                          <span>{art.language === "en" ? "🇬🇧 EN" : "🇫🇷 FR"}</span>
                        </span>
                      </td>

                      {/* Category */}
                      <td className="py-3.5 px-4 whitespace-nowrap">
                        <span
                          className={`inline-block px-2.5 py-0.5 rounded-full text-[11px] font-medium ${categoryConfig.badgeColor}`}
                        >
                          {art.language === "en"
                            ? categoryConfig.labelEn
                            : categoryConfig.labelFr}
                        </span>
                      </td>

                      {/* Status */}
                      <td className="py-3.5 px-4 whitespace-nowrap">
                        {art.status === "PUBLISHED" && (
                          <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-green-100 text-green-800 dark:bg-green-900/40 dark:text-green-300">
                            <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" />
                            <span>Publié</span>
                          </span>
                        )}
                        {art.status === "DRAFT" && (
                          <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-amber-100 text-amber-800 dark:bg-amber-900/40 dark:text-amber-300">
                            <span className="w-1.5 h-1.5 rounded-full bg-amber-500" />
                            <span>Brouillon</span>
                          </span>
                        )}
                        {art.status === "UNPUBLISHED" && (
                          <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-zinc-200 text-zinc-700 dark:bg-zinc-800 dark:text-zinc-400">
                            <span className="w-1.5 h-1.5 rounded-full bg-zinc-400" />
                            <span>Dépublié</span>
                          </span>
                        )}
                      </td>

                      {/* Author */}
                      <td className="py-3.5 px-4 whitespace-nowrap">
                        <span className="font-medium text-zinc-900 dark:text-zinc-200 block">
                          {art.author?.name || "Car Relais"}
                        </span>
                        <span className="text-[10px] text-zinc-400">
                          {art.author?.role || "Rédaction"}
                        </span>
                      </td>

                      {/* Date */}
                      <td className="py-3.5 px-4 whitespace-nowrap text-zinc-500">
                        {new Date(art.publishedAt || art.createdAt).toLocaleDateString("fr-FR", {
                          day: "numeric",
                          month: "short",
                          year: "numeric",
                        })}
                      </td>

                      {/* Actions */}
                      <td className="py-3.5 px-4 text-right whitespace-nowrap">
                        <div className="flex items-center justify-end gap-1">
                          {/* Quick Publish / Unpublish Toggle */}
                          <button
                            type="button"
                            onClick={() => handleQuickStatusToggle(art)}
                            disabled={togglingId === art.id}
                            title={
                              art.status === "PUBLISHED"
                                ? "Dépublier l'article"
                                : "Publier l'article immédiatement"
                            }
                            className={`p-1.5 rounded-lg text-xs font-semibold transition-colors ${
                              art.status === "PUBLISHED"
                                ? "text-amber-600 hover:bg-amber-50 dark:hover:bg-amber-950/40"
                                : "text-green-600 hover:bg-green-50 dark:hover:bg-green-950/40"
                            }`}
                          >
                            <Power className="w-3.5 h-3.5" />
                          </button>

                          {/* Preview Link */}
                          <Link
                            href={`/admin/articles/${art.id}/preview`}
                            target="_blank"
                            title="Aperçu avant publication"
                            className="p-1.5 rounded-lg text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-100 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"
                          >
                            <Eye className="w-3.5 h-3.5" />
                          </Link>

                          {/* Public Link (if published) */}
                          {art.status === "PUBLISHED" && (
                            <Link
                              href={publicUrl}
                              target="_blank"
                              title="Voir sur le site public"
                              className="p-1.5 rounded-lg text-zinc-500 hover:text-primary hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"
                            >
                              <ExternalLink className="w-3.5 h-3.5" />
                            </Link>
                          )}

                          {/* Edit */}
                          <Link
                            href={`/admin/articles/${art.id}/edit`}
                            title="Modifier"
                            className="p-1.5 rounded-lg text-zinc-700 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"
                          >
                            <Edit className="w-3.5 h-3.5" />
                          </Link>

                          {/* Delete */}
                          <button
                            type="button"
                            onClick={() =>
                              setArticleToDelete({ id: art.id, title: art.title })
                            }
                            title="Supprimer"
                            className="p-1.5 rounded-lg text-red-500 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-950/40 transition-colors cursor-pointer"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination Controls */}
        <PaginationControls
          currentPage={currentPage}
          totalPages={totalPages}
          totalCount={currentTotal}
          pageSize={pageSize}
          basePath="/admin/articles"
          itemLabel="articles"
        />
      </div>

      {/* Delete Confirmation Modal */}
      {articleToDelete && (
        <DeleteArticleModal
          articleId={articleToDelete.id}
          articleTitle={articleToDelete.title}
          isOpen={Boolean(articleToDelete)}
          onClose={() => setArticleToDelete(null)}
          onDeleted={() => {
            const deletedId = articleToDelete.id;
            setItems((prev) => prev.filter((a) => a.id !== deletedId));
            setCurrentTotal((prev) => Math.max(0, prev - 1));
            setArticleToDelete(null);
            router.refresh();
          }}
        />
      )}
    </div>
  );
}
