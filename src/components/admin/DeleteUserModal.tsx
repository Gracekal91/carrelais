"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { 
  Trash2, 
  AlertTriangle, 
  X, 
  Loader2, 
  Store, 
  User as UserIcon,
  ShieldAlert
} from "lucide-react";
import { User } from "@/lib/db/schema";
import { deleteUserAction } from "@/lib/actions";

interface DeleteUserModalProps {
  user: User | null;
  isOpen: boolean;
  onClose: () => void;
  stats?: {
    total: number;
    active: number;
    sold: number;
    rejected: number;
  };
}

export default function DeleteUserModal({
  user,
  isOpen,
  onClose,
  stats = { total: 0, active: 0, sold: 0, rejected: 0 },
}: DeleteUserModalProps) {
  const router = useRouter();
  const [reason, setReason] = React.useState("");
  const [confirmText, setConfirmText] = React.useState("");
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState("");
  const [successMessage, setSuccessMessage] = React.useState("");

  React.useEffect(() => {
    if (isOpen) {
      setReason("");
      setConfirmText("");
      setError("");
      setSuccessMessage("");
    }
  }, [isOpen]);

  if (!isOpen || !user) return null;

  const displayName =
    user.accountType === "DEALERSHIP" && user.dealershipName
      ? user.dealershipName
      : `${user.firstName} ${user.lastName}`;

  const handleDelete = async (e: React.FormEvent) => {
    e.preventDefault();
    if (confirmText.trim().toUpperCase() !== "SUPPRIMER") {
      setError('Veuillez saisir "SUPPRIMER" pour confirmer l\'action.');
      return;
    }

    setLoading(true);
    setError("");

    try {
      const res = await deleteUserAction(user.id, reason.trim());
      if (res.success) {
        setSuccessMessage(res.message || "Utilisateur définitivement supprimé de la base.");
        setTimeout(() => {
          router.refresh();
          onClose();
        }, 1200);
      } else {
        setError(res.error || "Une erreur est survenue lors de la suppression.");
      }
    } catch (err: any) {
      setError(err.message || "Impossible de supprimer cet utilisateur.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in">
      <div 
        className="relative w-full max-w-md bg-white dark:bg-zinc-900 rounded-2xl shadow-2xl border border-red-200 dark:border-red-900/50 p-6 space-y-5"
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-red-100 dark:bg-red-950/60 text-red-600 dark:text-red-400 flex items-center justify-center font-bold border border-red-200 dark:border-red-900/60 shrink-0">
              <Trash2 className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="text-xs font-bold uppercase tracking-wider text-red-600 dark:text-red-400 flex items-center gap-1">
                  <ShieldAlert className="w-3.5 h-3.5" />
                  Action Super Admin
                </span>
              </div>
              <h3 className="text-lg font-bold text-zinc-900 dark:text-zinc-100">
                Supprimer l&apos;utilisateur
              </h3>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            disabled={loading}
            className="p-1.5 text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200 rounded-lg hover:bg-zinc-100 dark:hover:bg-zinc-800 disabled:opacity-50 cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Target Profile Summary Card */}
        <div className="bg-zinc-50 dark:bg-zinc-800/60 rounded-xl p-3.5 border border-zinc-200 dark:border-zinc-800 space-y-2">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-zinc-200 dark:bg-zinc-700 flex items-center justify-center shrink-0">
              {user.accountType === "DEALERSHIP" ? (
                <Store className="w-4 h-4 text-blue-500" />
              ) : (
                <UserIcon className="w-4 h-4 text-zinc-600 dark:text-zinc-300" />
              )}
            </div>
            <div className="min-w-0 flex-1">
              <p className="font-bold text-sm text-zinc-900 dark:text-zinc-100 truncate">
                {displayName}
              </p>
              <p className="text-xs text-zinc-500 truncate">{user.email}</p>
            </div>
            <span className="text-[11px] font-semibold px-2 py-0.5 rounded-full bg-zinc-200 dark:bg-zinc-700 text-zinc-700 dark:text-zinc-300">
              {user.role}
            </span>
          </div>

          {stats.total > 0 && (
            <div className="text-[11px] text-amber-700 dark:text-amber-400 bg-amber-50 dark:bg-amber-950/30 p-2 rounded-lg border border-amber-200 dark:border-amber-900/40">
              ⚠️ Cet utilisateur possède <strong>{stats.total} annonce(s)</strong> qui seront également supprimées de la base de données.
            </div>
          )}
        </div>

        {/* Warning Banner */}
        <div className="p-3 bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-900/50 rounded-xl space-y-1 text-xs text-red-700 dark:text-red-400">
          <div className="flex items-center gap-1.5 font-bold">
            <AlertTriangle className="w-4 h-4 shrink-0" />
            <span>Suppression définitive de la base de données</span>
          </div>
          <p className="leading-relaxed">
            Cette action est <strong>immédiate et irréversible</strong>. Le compte, les informations de profil, les sessions et toutes les annonces publiées par cet utilisateur seront définitivement effacés de MongoDB.
          </p>
        </div>

        {error && (
          <div className="p-3 rounded-xl bg-red-100 dark:bg-red-950/50 text-red-700 dark:text-red-300 text-xs font-semibold border border-red-200 dark:border-red-900 flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {successMessage && (
          <div className="p-3 rounded-xl bg-emerald-100 dark:bg-emerald-950/50 text-emerald-700 dark:text-emerald-300 text-xs font-semibold border border-emerald-200 dark:border-emerald-900 flex items-center gap-2">
            <span>✓ {successMessage}</span>
          </div>
        )}

        {!successMessage && (
          <form onSubmit={handleDelete} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300 mb-1">
                Motif de la suppression (optionnel) :
              </label>
              <input
                type="text"
                value={reason}
                onChange={e => setReason(e.target.value)}
                placeholder="Ex: Demande de l'utilisateur, compte frauduleux, spam..."
                disabled={loading}
                className="w-full px-3 py-2 text-xs rounded-xl border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 focus:outline-none focus:ring-2 focus:ring-red-500/20"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300 mb-1">
                Pour confirmer, veuillez saisir <span className="font-mono text-red-600 dark:text-red-400 font-bold">SUPPRIMER</span> ci-dessous :
              </label>
              <input
                type="text"
                value={confirmText}
                onChange={e => setConfirmText(e.target.value)}
                placeholder="SUPPRIMER"
                disabled={loading}
                className="w-full px-3 py-2 text-xs font-mono font-bold uppercase rounded-xl border border-red-300 dark:border-red-800 bg-white dark:bg-zinc-800 text-red-600 dark:text-red-400 focus:outline-none focus:ring-2 focus:ring-red-500/30"
              />
            </div>

            <div className="flex items-center justify-end gap-2.5 pt-2 border-t border-zinc-200 dark:border-zinc-800">
              <button
                type="button"
                onClick={onClose}
                disabled={loading}
                className="px-4 py-2 text-xs font-semibold text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white rounded-xl hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors cursor-pointer"
              >
                Annuler
              </button>
              <button
                type="submit"
                disabled={loading || confirmText.trim().toUpperCase() !== "SUPPRIMER"}
                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-red-600 hover:bg-red-700 text-white text-xs font-bold shadow-xs transition-colors disabled:opacity-50 cursor-pointer"
              >
                {loading ? (
                  <>
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    <span>Suppression en cours...</span>
                  </>
                ) : (
                  <>
                    <Trash2 className="w-3.5 h-3.5" />
                    <span>Supprimer définitivement</span>
                  </>
                )}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
