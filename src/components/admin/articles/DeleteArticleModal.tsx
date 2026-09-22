"use client";

import React, { useState } from "react";
import { Trash2, AlertTriangle, Loader2 } from "lucide-react";
import { deleteArticleAction } from "@/lib/article-actions";

interface DeleteArticleModalProps {
  articleId: string;
  articleTitle: string;
  isOpen: boolean;
  onClose: () => void;
  onDeleted: () => void;
}

export default function DeleteArticleModal({
  articleId,
  articleTitle,
  isOpen,
  onClose,
  onDeleted,
}: DeleteArticleModalProps) {
  const [isDeleting, setIsDeleting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleDelete = async () => {
    try {
      setIsDeleting(true);
      setError(null);
      const res = await deleteArticleAction(articleId);
      if (!res.success) {
        setError(res.error || "Erreur lors de la suppression");
        return;
      }
      onDeleted();
      onClose();
    } catch (err: any) {
      setError(err.message || "Erreur lors de la suppression");
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-xs p-4">
      <div className="bg-white dark:bg-zinc-900 rounded-2xl max-w-md w-full p-6 border border-zinc-200 dark:border-zinc-800 shadow-2xl space-y-4">
        <div className="w-12 h-12 rounded-full bg-red-100 dark:bg-red-950/50 flex items-center justify-center text-red-600 mx-auto">
          <AlertTriangle className="w-6 h-6" />
        </div>

        <div className="text-center space-y-2">
          <h3 className="text-lg font-bold text-zinc-900 dark:text-zinc-100">
            Supprimer cet article ?
          </h3>
          <p className="text-xs text-zinc-500 leading-relaxed">
            Êtes-vous sûr de vouloir supprimer définitivement l&apos;article{" "}
            <strong className="text-zinc-800 dark:text-zinc-200">&ldquo;{articleTitle}&rdquo;</strong> ?
            Cette action est irréversible et déliera toute version traduite associée.
          </p>
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
            className="px-4 py-2 rounded-xl text-xs font-semibold text-zinc-700 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"
          >
            Annuler
          </button>
          <button
            type="button"
            onClick={handleDelete}
            disabled={isDeleting}
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold bg-red-600 hover:bg-red-700 text-white transition-all shadow-md shadow-red-600/20"
          >
            {isDeleting ? (
              <Loader2 className="w-3.5 h-3.5 animate-spin" />
            ) : (
              <Trash2 className="w-3.5 h-3.5" />
            )}
            <span>Confirmer la suppression</span>
          </button>
        </div>
      </div>
    </div>
  );
}
