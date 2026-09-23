"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { AlertTriangle, Trash2, Loader2, X } from "lucide-react";
import { deleteListingAction } from "@/lib/actions";

interface DeleteListingModalProps {
  listingId: string;
  listingTitle: string;
  isOpen: boolean;
  onClose: () => void;
  onDeleted?: () => void;
  redirectTo?: string;
}

export default function DeleteListingModal({
  listingId,
  listingTitle,
  isOpen,
  onClose,
  onDeleted,
  redirectTo,
}: DeleteListingModalProps) {
  const router = useRouter();
  const [isDeleting, setIsDeleting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleDelete = async () => {
    try {
      setIsDeleting(true);
      setError(null);
      const res = await deleteListingAction(listingId);
      if (!res.success) {
        setError(res.error || "Erreur lors de la suppression de l'annonce");
        return;
      }

      if (onDeleted) {
        onDeleted();
      }

      onClose();

      if (redirectTo) {
        router.push(redirectTo);
      } else {
        router.refresh();
      }
    } catch (err: any) {
      setError(err.message || "Erreur inattendue lors de la suppression");
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-xs p-4 animate-in fade-in duration-200">
      <div className="bg-white dark:bg-zinc-900 rounded-2xl max-w-md w-full p-6 border border-zinc-200 dark:border-zinc-800 shadow-2xl space-y-4">
        <div className="flex items-start justify-between">
          <div className="w-12 h-12 rounded-full bg-red-100 dark:bg-red-950/50 flex items-center justify-center text-red-600">
            <AlertTriangle className="w-6 h-6" />
          </div>
          <button
            type="button"
            onClick={onClose}
            disabled={isDeleting}
            className="p-1 text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200 rounded-lg"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="space-y-2">
          <h3 className="text-lg font-bold text-zinc-900 dark:text-zinc-100">
            Supprimer cette annonce ?
          </h3>
          <p className="text-xs text-zinc-600 dark:text-zinc-400 leading-relaxed">
            Êtes-vous sûr de vouloir supprimer définitivement l&apos;annonce{" "}
            <strong className="text-zinc-900 dark:text-zinc-100">&ldquo;{listingTitle}&rdquo;</strong> ?
          </p>
          <div className="p-3 rounded-xl bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-900/40 text-amber-800 dark:text-amber-300 text-[11px] leading-relaxed">
            Cette action est <strong>irréversible</strong>. Le véhicule sera immédiatement retiré du catalogue public, de la recherche et de la base de données.
          </div>
        </div>

        {error && (
          <div className="p-3 rounded-xl bg-red-50 dark:bg-red-950/50 border border-red-200 dark:border-red-900 text-xs text-red-700 dark:text-red-300">
            {error}
          </div>
        )}

        <div className="flex items-center justify-end gap-2 pt-2">
          <button
            type="button"
            onClick={onClose}
            disabled={isDeleting}
            className="px-4 py-2 rounded-xl text-xs font-semibold text-zinc-700 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors cursor-pointer"
          >
            Annuler
          </button>
          <button
            type="button"
            onClick={handleDelete}
            disabled={isDeleting}
            className="inline-flex items-center gap-1.5 px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-xl text-xs font-bold transition-colors disabled:opacity-50 cursor-pointer shadow-sm"
          >
            {isDeleting ? (
              <>
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
                <span>Suppression...</span>
              </>
            ) : (
              <>
                <Trash2 className="w-3.5 h-3.5" />
                <span>Supprimer définitivement</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
