"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import { 
  User as UserIcon, 
  Store, 
  Phone, 
  Mail, 
  MapPin, 
  Calendar, 
  Ban, 
  CheckCircle2, 
  X, 
  AlertTriangle, 
  Loader2,
  ExternalLink,
  Trash2
} from "lucide-react";
import { User } from "@/lib/db/schema";
import { toggleUserStatusAction } from "@/lib/actions";
import Link from "next/link";

interface UserDetailsModalProps {
  user: User | null;
  isOpen: boolean;
  onClose: () => void;
  stats?: {
    total: number;
    active: number;
    sold: number;
    rejected: number;
  };
  isSuperAdmin?: boolean;
  currentUserId?: string;
  onDeleteClick?: () => void;
}

export default function UserDetailsModal({
  user,
  isOpen,
  onClose,
  stats = { total: 0, active: 0, sold: 0, rejected: 0 },
  isSuperAdmin,
  currentUserId,
  onDeleteClick,
}: UserDetailsModalProps) {
  const t = useTranslations("AdminPortal.users.detailsModal");
  const router = useRouter();

  const [showSuspendConfirm, setShowSuspendConfirm] = React.useState(false);
  const [suspendReason, setSuspendReason] = React.useState("");
  const [loading, setLoading] = React.useState(false);

  if (!isOpen || !user) return null;

  const isSuspended = user.status === "SUSPENDED";

  const handleToggleStatus = async () => {
    setLoading(true);
    try {
      const newStatus = isSuspended ? "ACTIVE" : "SUSPENDED";
      const res = await toggleUserStatusAction(user.id, newStatus, suspendReason);
      if (res.success) {
        setShowSuspendConfirm(false);
        setSuspendReason("");
        router.refresh();
        onClose();
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in">
      <div 
        className="relative w-full max-w-lg bg-white dark:bg-zinc-900 rounded-2xl shadow-2xl border border-zinc-200 dark:border-zinc-800 p-6 space-y-6"
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-zinc-100 dark:bg-zinc-800 flex items-center justify-center text-zinc-700 dark:text-zinc-300 font-bold text-lg border border-zinc-200 dark:border-zinc-700">
              {user.accountType === "DEALERSHIP" ? <Store className="w-6 h-6 text-primary" /> : <UserIcon className="w-6 h-6 text-zinc-600 dark:text-zinc-400" />}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-lg font-bold text-zinc-900 dark:text-zinc-100">
                  {user.accountType === "DEALERSHIP" && user.dealershipName ? user.dealershipName : `${user.firstName} ${user.lastName}`}
                </h3>
                <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                  isSuspended
                    ? "bg-red-100 text-red-700 dark:bg-red-950/50 dark:text-red-400"
                    : "bg-emerald-100 text-emerald-700 dark:bg-emerald-950/50 dark:text-emerald-400"
                }`}>
                  {isSuspended ? "Suspendu" : "Actif"}
                </span>
              </div>
              <p className="text-xs text-zinc-500">{user.email}</p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200 rounded-lg hover:bg-zinc-100 dark:hover:bg-zinc-800"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Contact info grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs bg-zinc-50 dark:bg-zinc-800/40 p-3.5 rounded-xl border border-zinc-200 dark:border-zinc-800">
          <div className="flex items-center gap-2 text-zinc-700 dark:text-zinc-300">
            <Phone className="w-4 h-4 text-zinc-400 shrink-0" />
            <span>{user.phone || "Non renseigné"}</span>
          </div>
          <div className="flex items-center gap-2 text-zinc-700 dark:text-zinc-300">
            <Mail className="w-4 h-4 text-zinc-400 shrink-0" />
            <span className="truncate">{user.email}</span>
          </div>
          <div className="flex items-center gap-2 text-zinc-700 dark:text-zinc-300">
            <MapPin className="w-4 h-4 text-zinc-400 shrink-0" />
            <span>{user.location || "RDC"}</span>
          </div>
          <div className="flex items-center gap-2 text-zinc-700 dark:text-zinc-300">
            <Calendar className="w-4 h-4 text-zinc-400 shrink-0" />
            <span>Inscrit le {new Date(user.joinedAt).toLocaleDateString("fr-FR")}</span>
          </div>
        </div>

        {/* Platform Activity */}
        <div className="space-y-2">
          <h4 className="text-xs font-bold text-zinc-500 uppercase tracking-wider">
            {t("activity")}
          </h4>
          <div className="grid grid-cols-4 gap-2 text-center">
            <div className="p-2.5 bg-zinc-50 dark:bg-zinc-800/50 rounded-xl border border-zinc-200 dark:border-zinc-800">
              <span className="text-lg font-bold text-zinc-900 dark:text-zinc-100 block">{stats.total}</span>
              <span className="text-[10px] text-zinc-500 block">Total</span>
            </div>
            <div className="p-2.5 bg-emerald-50/50 dark:bg-emerald-950/20 rounded-xl border border-emerald-200 dark:border-emerald-900/40">
              <span className="text-lg font-bold text-emerald-700 dark:text-emerald-400 block">{stats.active}</span>
              <span className="text-[10px] text-emerald-600 dark:text-emerald-400/80 block">Actives</span>
            </div>
            <div className="p-2.5 bg-blue-50/50 dark:bg-blue-950/20 rounded-xl border border-blue-200 dark:border-blue-900/40">
              <span className="text-lg font-bold text-blue-700 dark:text-blue-400 block">{stats.sold}</span>
              <span className="text-[10px] text-blue-600 dark:text-blue-400/80 block">Vendues</span>
            </div>
            <div className="p-2.5 bg-red-50/50 dark:bg-red-950/20 rounded-xl border border-red-200 dark:border-red-900/40">
              <span className="text-lg font-bold text-red-700 dark:text-red-400 block">{stats.rejected}</span>
              <span className="text-[10px] text-red-600 dark:text-red-400/80 block">Rejetées</span>
            </div>
          </div>
        </div>

        {/* Public Storefront Link if dealer */}
        {user.accountType === "DEALERSHIP" && (
          <div className="pt-2">
            <Link
              href={`/dealers/${user.id}`}
              target="_blank"
              className="inline-flex items-center gap-1.5 text-xs text-primary font-semibold hover:underline"
            >
              <span>Consulter la vitrine publique du concessionnaire</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </Link>
          </div>
        )}

        {/* Account Suspension / Reactivation Workflow */}
        {showSuspendConfirm ? (
          <div className="p-4 rounded-xl bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-900/50 space-y-3">
            <div className="flex items-center gap-2 text-amber-800 dark:text-amber-300 text-xs font-bold">
              <AlertTriangle className="w-4 h-4" />
              <span>{isSuspended ? "Confirmer la réactivation" : t("suspendConfirmTitle")}</span>
            </div>
            {!isSuspended && (
              <>
                <p className="text-xs text-amber-700 dark:text-amber-400">
                  {t("suspendConfirmMsg")}
                </p>
                <input
                  type="text"
                  value={suspendReason}
                  onChange={e => setSuspendReason(e.target.value)}
                  placeholder={t("suspendReasonPlaceholder")}
                  className="w-full p-2 text-xs rounded-lg border border-amber-300 dark:border-amber-800 bg-white dark:bg-zinc-900"
                />
              </>
            )}
            <div className="flex items-center justify-end gap-2 pt-1">
              <button
                type="button"
                onClick={() => setShowSuspendConfirm(false)}
                disabled={loading}
                className="px-3 py-1.5 text-xs font-medium text-zinc-600 dark:text-zinc-400"
              >
                Annuler
              </button>
              <button
                type="button"
                onClick={handleToggleStatus}
                disabled={loading}
                className={`inline-flex items-center gap-1.5 px-4 py-1.5 text-xs font-bold rounded-lg text-white ${
                  isSuspended ? "bg-emerald-600 hover:bg-emerald-700" : "bg-red-600 hover:bg-red-700"
                }`}
              >
                {loading && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                <span>{isSuspended ? t("confirmReactivate") : t("confirmSuspend")}</span>
              </button>
            </div>
          </div>
        ) : (
          <div className="flex items-center justify-between pt-2 border-t border-zinc-200 dark:border-zinc-800">
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setShowSuspendConfirm(true)}
                className={`inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-semibold transition-colors cursor-pointer ${
                  isSuspended
                    ? "bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-400 hover:bg-emerald-100"
                    : "bg-amber-50 dark:bg-amber-950/40 text-amber-700 dark:text-amber-400 hover:bg-amber-100"
                }`}
              >
                {isSuspended ? <CheckCircle2 className="w-4 h-4" /> : <Ban className="w-4 h-4" />}
                <span>{isSuspended ? t("reactivateBtn") : t("suspendBtn")}</span>
              </button>

              {isSuperAdmin && user.id !== currentUserId && (
                <button
                  type="button"
                  onClick={() => {
                    if (onDeleteClick) onDeleteClick();
                  }}
                  className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-semibold text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-950/40 hover:bg-red-100 dark:hover:bg-red-900/50 transition-colors cursor-pointer border border-red-200/60 dark:border-red-900/40"
                  title="Supprimer définitivement l'utilisateur de la base de données"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  <span>Supprimer</span>
                </button>
              )}
            </div>

            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-semibold text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white rounded-xl hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors cursor-pointer"
            >
              {t("close")}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
