"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import { 
  CheckCircle2, 
  XCircle, 
  Clock, 
  Ban, 
  FileText, 
  AlertTriangle, 
  Loader2,
  Check,
  Trash2
} from "lucide-react";
import { VehicleStatus } from "@/types";
import { 
  approveListingAction, 
  rejectListingAction, 
  setListingStatusAction 
} from "@/lib/actions";
import DeleteListingModal from "./DeleteListingModal";

interface ListingReviewActionsProps {
  listingId: string;
  currentStatus: VehicleStatus;
  title: string;
}

export default function ListingReviewActions({
  listingId,
  currentStatus,
  title,
}: ListingReviewActionsProps) {
  const t = useTranslations("AdminPortal.review");
  const router = useRouter();

  // Modals state
  const [showApproveModal, setShowApproveModal] = React.useState(false);
  const [showRejectModal, setShowRejectModal] = React.useState(false);
  const [showDeleteModal, setShowDeleteModal] = React.useState(false);
  const [loading, setLoading] = React.useState(false);
  const [feedback, setFeedback] = React.useState<{ type: "success" | "error"; message: string } | null>(null);

  // Rejection form
  const [rejectReason, setRejectReason] = React.useState("incomplete");
  const [rejectComment, setRejectComment] = React.useState("");

  const predefinedReasons = [
    { key: "incomplete", label: t("rejectModal.reasons.incomplete") },
    { key: "photos", label: t("rejectModal.reasons.photos") },
    { key: "incorrect", label: t("rejectModal.reasons.incorrect") },
    { key: "price", label: t("rejectModal.reasons.price") },
    { key: "description", label: t("rejectModal.reasons.description") },
    { key: "inappropriate", label: t("rejectModal.reasons.inappropriate") },
    { key: "sold", label: t("rejectModal.reasons.sold") },
    { key: "duplicate", label: t("rejectModal.reasons.duplicate") },
    { key: "other", label: t("rejectModal.reasons.other") },
  ];

  const handleApprove = async () => {
    setLoading(true);
    setFeedback(null);
    try {
      const res = await approveListingAction(listingId);
      if (res.success) {
        setFeedback({ type: "success", message: "Annonce approuvée et publiée avec succès !" });
        setShowApproveModal(false);
        router.refresh();
      } else {
        setFeedback({ type: "error", message: res.error || "Erreur lors de l'approbation" });
      }
    } catch (err: any) {
      setFeedback({ type: "error", message: err.message || "Une erreur est survenue" });
    } finally {
      setLoading(false);
    }
  };

  const handleReject = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setFeedback(null);
    try {
      const selectedReasonObj = predefinedReasons.find(r => r.key === rejectReason);
      const reasonLabel = selectedReasonObj ? selectedReasonObj.label : rejectReason;

      const res = await rejectListingAction(listingId, reasonLabel, rejectComment);
      if (res.success) {
        setFeedback({ type: "success", message: "Annonce rejetée avec motif enregistré." });
        setShowRejectModal(false);
        router.refresh();
      } else {
        setFeedback({ type: "error", message: res.error || "Erreur lors du rejet" });
      }
    } catch (err: any) {
      setFeedback({ type: "error", message: err.message || "Une erreur est survenue" });
    } finally {
      setLoading(false);
    }
  };

  const handleSetStatus = async (status: VehicleStatus, note: string) => {
    setLoading(true);
    setFeedback(null);
    try {
      const res = await setListingStatusAction(listingId, status, note);
      if (res.success) {
        setFeedback({ type: "success", message: `Statut mis à jour vers : ${status}` });
        router.refresh();
      } else {
        setFeedback({ type: "error", message: res.error || "Erreur lors du changement de statut" });
      }
    } catch (err: any) {
      setFeedback({ type: "error", message: err.message || "Une erreur est survenue" });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white dark:bg-zinc-900 rounded-2xl border border-zinc-200 dark:border-zinc-800 p-6 space-y-5 shadow-xs sticky top-8">
      <div>
        <h3 className="text-base font-bold text-zinc-900 dark:text-zinc-100 flex items-center gap-2">
          {t("actionsTitle")}
        </h3>
        <p className="text-xs text-zinc-500 mt-1">
          Prenez une décision de modération pour cette annonce.
        </p>
      </div>

      {feedback && (
        <div
          className={`p-3 rounded-xl text-xs flex items-center gap-2 ${
            feedback.type === "success"
              ? "bg-emerald-50 dark:bg-emerald-950/40 text-emerald-800 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-900"
              : "bg-red-50 dark:bg-red-950/40 text-red-800 dark:text-red-300 border border-red-200 dark:border-red-900"
          }`}
        >
          {feedback.type === "success" ? <Check className="w-4 h-4 shrink-0" /> : <AlertTriangle className="w-4 h-4 shrink-0" />}
          <span>{feedback.message}</span>
        </div>
      )}

      {/* Primary Action Buttons */}
      <div className="space-y-3">
        {currentStatus !== "PUBLISHED" && (
          <button
            type="button"
            onClick={() => setShowApproveModal(true)}
            disabled={loading}
            className="w-full flex items-center justify-center gap-2 py-3 px-4 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-sm font-semibold transition-colors shadow-sm cursor-pointer disabled:opacity-50"
          >
            <CheckCircle2 className="w-4 h-4" />
            <span>{t("approveBtn")}</span>
          </button>
        )}

        {currentStatus !== "REJECTED" && (
          <button
            type="button"
            onClick={() => setShowRejectModal(true)}
            disabled={loading}
            className="w-full flex items-center justify-center gap-2 py-3 px-4 bg-red-600 hover:bg-red-700 text-white rounded-xl text-sm font-semibold transition-colors shadow-sm cursor-pointer disabled:opacity-50"
          >
            <XCircle className="w-4 h-4" />
            <span>{t("rejectBtn")}</span>
          </button>
        )}
      </div>

      {/* Secondary Actions Divider */}
      <div className="pt-4 border-t border-zinc-200 dark:border-zinc-800 space-y-2">
        <span className="text-[11px] font-bold text-zinc-400 uppercase tracking-wider block mb-2">
          Autres actions
        </span>

        {currentStatus !== "PENDING_REVIEW" && (
          <button
            type="button"
            onClick={() => handleSetStatus("PENDING_REVIEW", "Remise en attente par l'administrateur")}
            disabled={loading}
            className="w-full flex items-center justify-center gap-2 py-2 px-3 border border-zinc-300 dark:border-zinc-700 hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded-xl text-xs font-medium text-zinc-700 dark:text-zinc-300 transition-colors cursor-pointer disabled:opacity-50"
          >
            <Clock className="w-3.5 h-3.5 text-amber-500" />
            <span>{t("putOnHoldBtn")}</span>
          </button>
        )}

        {currentStatus === "PUBLISHED" && (
          <>
            <button
              type="button"
              onClick={() => handleSetStatus("SUSPENDED", "Annonce suspendue par l'administrateur")}
              disabled={loading}
              className="w-full flex items-center justify-center gap-2 py-2 px-3 border border-purple-300 dark:border-purple-800 text-purple-700 dark:text-purple-300 hover:bg-purple-50 dark:hover:bg-purple-950/30 rounded-xl text-xs font-medium transition-colors cursor-pointer disabled:opacity-50"
            >
              <Ban className="w-3.5 h-3.5" />
              <span>{t("suspendBtn")}</span>
            </button>

            <button
              type="button"
              onClick={() => handleSetStatus("DRAFT", "Annonce passée au brouillon par l'administrateur")}
              disabled={loading}
              className="w-full flex items-center justify-center gap-2 py-2 px-3 border border-zinc-300 dark:border-zinc-700 text-zinc-600 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded-xl text-xs font-medium transition-colors cursor-pointer disabled:opacity-50"
            >
              <FileText className="w-3.5 h-3.5" />
              <span>{t("unpublishBtn")}</span>
            </button>
          </>
        )}

        <button
          type="button"
          onClick={() => setShowDeleteModal(true)}
          disabled={loading}
          className="w-full flex items-center justify-center gap-2 py-2 px-3 border border-red-200 dark:border-red-900/50 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/30 rounded-xl text-xs font-semibold transition-colors cursor-pointer disabled:opacity-50 mt-1"
        >
          <Trash2 className="w-3.5 h-3.5" />
          <span>Supprimer l'annonce</span>
        </button>
      </div>

      {/* APPROVAL CONFIRMATION MODAL */}
      {showApproveModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in">
          <div className="relative w-full max-w-md bg-white dark:bg-zinc-900 rounded-2xl shadow-2xl border border-zinc-200 dark:border-zinc-800 p-6 space-y-5">
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-full bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400">
                <CheckCircle2 className="w-6 h-6" />
              </div>
              <div>
                <h3 className="font-bold text-zinc-900 dark:text-zinc-100 text-base">
                  {t("approveModal.title")}
                </h3>
                <p className="text-xs text-zinc-500">{title}</p>
              </div>
            </div>

            <p className="text-sm text-zinc-600 dark:text-zinc-400 leading-relaxed">
              {t("approveModal.message")}
            </p>

            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={() => setShowApproveModal(false)}
                disabled={loading}
                className="px-4 py-2 text-xs font-semibold text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white cursor-pointer"
              >
                {t("approveModal.cancel")}
              </button>
              <button
                type="button"
                onClick={handleApprove}
                disabled={loading}
                className="inline-flex items-center gap-2 px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-xl transition-colors shadow-xs cursor-pointer disabled:opacity-50"
              >
                {loading && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                <span>{t("approveModal.confirm")}</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* REJECTION MODAL WITH REASON & COMMENT */}
      {showRejectModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in">
          <div className="relative w-full max-w-lg bg-white dark:bg-zinc-900 rounded-2xl shadow-2xl border border-zinc-200 dark:border-zinc-800 p-6 space-y-5">
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-full bg-red-50 dark:bg-red-950/60 text-red-600 dark:text-red-400">
                <XCircle className="w-6 h-6" />
              </div>
              <div>
                <h3 className="font-bold text-zinc-900 dark:text-zinc-100 text-base">
                  {t("rejectModal.title")}
                </h3>
                <p className="text-xs text-zinc-500">{title}</p>
              </div>
            </div>

            <form onSubmit={handleReject} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-zinc-700 dark:text-zinc-300 mb-2">
                  {t("rejectModal.reasonLabel")}
                </label>
                <div className="grid grid-cols-1 gap-1.5 max-h-48 overflow-y-auto pr-1">
                  {predefinedReasons.map(r => (
                    <label
                      key={r.key}
                      className={`flex items-center gap-2.5 p-2.5 rounded-xl border text-xs cursor-pointer transition-all ${
                        rejectReason === r.key
                          ? "border-red-500 bg-red-50/50 dark:bg-red-950/20 text-red-900 dark:text-red-200 font-semibold"
                          : "border-zinc-200 dark:border-zinc-800 hover:bg-zinc-50 dark:hover:bg-zinc-800/50 text-zinc-700 dark:text-zinc-300"
                      }`}
                    >
                      <input
                        type="radio"
                        name="rejectReason"
                        value={r.key}
                        checked={rejectReason === r.key}
                        onChange={() => setRejectReason(r.key)}
                        className="text-red-600 focus:ring-red-500"
                      />
                      <span>{r.label}</span>
                    </label>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-zinc-700 dark:text-zinc-300 mb-1.5">
                  {t("rejectModal.commentLabel")}
                </label>
                <textarea
                  rows={3}
                  value={rejectComment}
                  onChange={e => setRejectComment(e.target.value)}
                  placeholder={t("rejectModal.commentPlaceholder")}
                  className="w-full p-3 rounded-xl border border-zinc-300 dark:border-zinc-700 bg-transparent text-xs text-zinc-900 dark:text-zinc-100 focus:ring-2 focus:ring-red-500 focus:border-red-500 resize-none"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowRejectModal(false)}
                  disabled={loading}
                  className="px-4 py-2 text-xs font-semibold text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white cursor-pointer"
                >
                  {t("rejectModal.cancel")}
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="inline-flex items-center gap-2 px-5 py-2.5 bg-red-600 hover:bg-red-700 text-white text-xs font-bold rounded-xl transition-colors shadow-xs cursor-pointer disabled:opacity-50"
                >
                  {loading && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                  <span>{t("rejectModal.confirm")}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* DELETE CONFIRMATION MODAL */}
      <DeleteListingModal
        listingId={listingId}
        listingTitle={title}
        isOpen={showDeleteModal}
        onClose={() => setShowDeleteModal(false)}
        redirectTo="/admin/listings"
      />
    </div>
  );
}
