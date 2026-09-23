"use client";

import React, { useState } from "react";
import Link from "next/link";
import { Eye, Trash2 } from "lucide-react";
import DeleteListingModal from "./DeleteListingModal";

interface ListingRowActionsProps {
  listingId: string;
  listingTitle: string;
  status: string;
  compact?: boolean;
}

export default function ListingRowActions({
  listingId,
  listingTitle,
  status,
  compact = false,
}: ListingRowActionsProps) {
  const [showDeleteModal, setShowDeleteModal] = useState(false);

  return (
    <>
      <div className={`flex items-center gap-2 ${compact ? "" : "justify-end"}`}>
        <Link
          href={`/admin/listings/${listingId}`}
          className={`inline-flex items-center gap-1.5 text-xs font-bold ${compact ? "px-3 py-1.5 rounded-lg" : "px-3 py-2 rounded-xl"} transition-all shadow-xs ${
            status === "PENDING_REVIEW"
              ? "bg-amber-600 hover:bg-amber-700 text-white"
              : "bg-zinc-100 dark:bg-zinc-800 hover:bg-zinc-200 dark:hover:bg-zinc-700 text-zinc-800 dark:text-zinc-200"
          }`}
        >
          <Eye className="w-3.5 h-3.5" />
          <span>Examiner</span>
        </Link>
        <button
          type="button"
          onClick={() => setShowDeleteModal(true)}
          className={`p-2 ${compact ? "rounded-lg" : "rounded-xl"} text-zinc-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-950/40 border border-zinc-200 dark:border-zinc-800 hover:border-red-200 dark:hover:border-red-900 transition-colors cursor-pointer`}
          title="Supprimer l'annonce"
          aria-label={`Supprimer l'annonce ${listingTitle}`}
        >
          <Trash2 className="w-3.5 h-3.5" />
        </button>
      </div>

      <DeleteListingModal
        listingId={listingId}
        listingTitle={listingTitle}
        isOpen={showDeleteModal}
        onClose={() => setShowDeleteModal(false)}
      />
    </>
  );
}
