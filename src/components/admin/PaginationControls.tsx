"use client";

import React from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { ChevronLeft, ChevronRight } from "lucide-react";

interface PaginationControlsProps {
  currentPage: number;
  totalPages: number;
  totalCount: number;
  pageSize: number;
  basePath: string;
  itemLabel?: string;
}

export default function PaginationControls({
  currentPage,
  totalPages,
  totalCount,
  pageSize,
  basePath,
  itemLabel = "éléments",
}: PaginationControlsProps) {
  const searchParams = useSearchParams();

  if (totalCount === 0) return null;

  const start = (currentPage - 1) * pageSize + 1;
  const end = Math.min(currentPage * pageSize, totalCount);

  const createPageUrl = (pageNumber: number) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set("page", pageNumber.toString());
    return `${basePath}?${params.toString()}`;
  };

  // Generate page numbers to display
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
    <div className="p-4 border-t border-zinc-200 dark:border-zinc-800 flex flex-col sm:flex-row items-center justify-between gap-3 text-sm">
      <div className="text-zinc-500 dark:text-zinc-400 text-xs">
        Affichage de <span className="font-semibold text-zinc-900 dark:text-zinc-100">{start}</span> à{" "}
        <span className="font-semibold text-zinc-900 dark:text-zinc-100">{end}</span> sur{" "}
        <span className="font-semibold text-zinc-900 dark:text-zinc-100">{totalCount}</span> {itemLabel}
      </div>

      {totalPages > 1 && (
        <div className="flex items-center gap-1.5">
          {/* Previous */}
          {currentPage > 1 ? (
            <Link
              href={createPageUrl(currentPage - 1)}
              className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg border border-zinc-300 dark:border-zinc-700 hover:bg-zinc-100 dark:hover:bg-zinc-800 text-xs font-medium text-zinc-700 dark:text-zinc-300 transition-colors"
            >
              <ChevronLeft className="w-3.5 h-3.5" />
              <span>Précédent</span>
            </Link>
          ) : (
            <span className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg border border-zinc-200 dark:border-zinc-800 text-xs font-medium text-zinc-400 dark:text-zinc-600 opacity-50 cursor-not-allowed">
              <ChevronLeft className="w-3.5 h-3.5" />
              <span>Précédent</span>
            </span>
          )}

          {/* Page numbers */}
          <div className="hidden sm:flex items-center gap-1">
            {pages.map((p, idx) => {
              if (p === "...") {
                return (
                  <span key={`dots-${idx}`} className="px-2 py-1 text-xs text-zinc-400">
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
                  className={`w-8 h-8 rounded-lg flex items-center justify-center text-xs font-medium transition-colors ${
                    isActive
                      ? "bg-primary text-white font-bold shadow-xs"
                      : "border border-zinc-200 dark:border-zinc-700 text-zinc-700 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800"
                  }`}
                >
                  {pageNum}
                </Link>
              );
            })}
          </div>

          {/* Next */}
          {currentPage < totalPages ? (
            <Link
              href={createPageUrl(currentPage + 1)}
              className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg border border-zinc-300 dark:border-zinc-700 hover:bg-zinc-100 dark:hover:bg-zinc-800 text-xs font-medium text-zinc-700 dark:text-zinc-300 transition-colors"
            >
              <span>Suivant</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </Link>
          ) : (
            <span className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg border border-zinc-200 dark:border-zinc-800 text-xs font-medium text-zinc-400 dark:text-zinc-600 opacity-50 cursor-not-allowed">
              <span>Suivant</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </span>
          )}
        </div>
      )}
    </div>
  );
}
