"use client";

import React from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { ChevronLeft, ChevronRight } from "lucide-react";

interface ArticlePaginationProps {
  currentPage: number;
  totalPages: number;
  basePath: string;
  locale: string;
}

export default function ArticlePagination({
  currentPage,
  totalPages,
  basePath,
  locale,
}: ArticlePaginationProps) {
  const searchParams = useSearchParams();

  if (totalPages <= 1) return null;

  const isEn = locale === "en";
  const prevLabel = isEn ? "Previous" : "Précédent";
  const nextLabel = isEn ? "Next" : "Suivant";

  const createPageUrl = (pageNumber: number) => {
    const params = new URLSearchParams(searchParams.toString());
    if (pageNumber <= 1) {
      params.delete("page");
    } else {
      params.set("page", pageNumber.toString());
    }
    const query = params.toString();
    return query ? `${basePath}?${query}` : basePath;
  };

  // Generate pagination range (1 2 3 ... 7)
  const pages: (number | string)[] = [];
  if (totalPages <= 7) {
    for (let i = 1; i <= totalPages; i++) pages.push(i);
  } else {
    pages.push(1);
    if (currentPage > 3) pages.push("...");
    const min = Math.max(2, currentPage - 1);
    const max = Math.min(totalPages - 1, currentPage + 1);
    for (let i = min; i <= max; i++) pages.push(i);
    if (currentPage < totalPages - 2) pages.push("...");
    pages.push(totalPages);
  }

  return (
    <nav
      aria-label="Pagination des articles"
      className="py-10 flex items-center justify-center gap-1.5 text-xs font-semibold"
    >
      {/* Previous Page */}
      {currentPage > 1 ? (
        <Link
          href={createPageUrl(currentPage - 1)}
          className="inline-flex items-center gap-1 px-3.5 py-2 rounded-xl border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-900 text-zinc-700 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors shadow-2xs"
          rel="prev"
        >
          <ChevronLeft className="w-4 h-4" />
          <span>{prevLabel}</span>
        </Link>
      ) : (
        <span className="inline-flex items-center gap-1 px-3.5 py-2 rounded-xl border border-zinc-200 dark:border-zinc-800 text-zinc-400 dark:text-zinc-600 opacity-50 cursor-not-allowed select-none">
          <ChevronLeft className="w-4 h-4" />
          <span>{prevLabel}</span>
        </span>
      )}

      {/* Page Numbers */}
      <div className="flex items-center gap-1">
        {pages.map((p, idx) => {
          if (p === "...") {
            return (
              <span key={`dots-${idx}`} className="px-2 py-1 text-zinc-400">
                ...
              </span>
            );
          }
          const pageNum = Number(p);
          const isActive = pageNum === currentPage;
          return (
            <Link
              key={pageNum}
              href={createPageUrl(pageNum)}
              aria-current={isActive ? "page" : undefined}
              className={`w-9 h-9 rounded-xl flex items-center justify-center transition-all ${
                isActive
                  ? "bg-primary text-white font-bold shadow-md shadow-primary/25"
                  : "border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-900 text-zinc-700 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800"
              }`}
            >
              {pageNum}
            </Link>
          );
        })}
      </div>

      {/* Next Page */}
      {currentPage < totalPages ? (
        <Link
          href={createPageUrl(currentPage + 1)}
          className="inline-flex items-center gap-1 px-3.5 py-2 rounded-xl border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-900 text-zinc-700 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors shadow-2xs"
          rel="next"
        >
          <span>{nextLabel}</span>
          <ChevronRight className="w-4 h-4" />
        </Link>
      ) : (
        <span className="inline-flex items-center gap-1 px-3.5 py-2 rounded-xl border border-zinc-200 dark:border-zinc-800 text-zinc-400 dark:text-zinc-600 opacity-50 cursor-not-allowed select-none">
          <span>{nextLabel}</span>
          <ChevronRight className="w-4 h-4" />
        </span>
      )}
    </nav>
  );
}
