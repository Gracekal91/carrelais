"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import { 
  AlertTriangle, 
  CheckCircle2, 
  XCircle, 
  X, 
  ExternalLink, 
  Loader2,
  Calendar,
  User as UserIcon
} from "lucide-react";
import { MarketplaceReport } from "@/lib/db/schema";
import { resolveReportAction } from "@/lib/actions";
import Link from "next/link";

interface ReportResolutionModalProps {
  report: MarketplaceReport | null;
  isOpen: boolean;
  onClose: () => void;
}

export default function ReportResolutionModal({
  report,
  isOpen,
  onClose,
}: ReportResolutionModalProps) {
  const t = useTranslations("AdminPortal.reports");
  const router = useRouter();

  const [resolutionNote, setResolutionNote] = React.useState("");
  const [loading, setLoading] = React.useState(false);

  if (!isOpen || !report) return null;

  const handleResolve = async (status: "RESOLVED" | "REJECTED") => {
    setLoading(true);
    try {
      const res = await resolveReportAction(report.id, status, resolutionNote);
      if (res.success) {
        setResolutionNote("");
        router.refresh();
        onClose();
      }
    } finally {
      setLoading(false);
    }
  };

  const targetLink = report.targetType === "LISTING"
    ? `/admin/listings/${report.targetId}`
    : `/dealers/${report.targetId}`;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in">
      <div 
        className="relative w-full max-w-lg bg-white dark:bg-zinc-900 rounded-2xl shadow-2xl border border-zinc-200 dark:border-zinc-800 p-6 space-y-5"
        onClick={e => e.stopPropagation()}
      >
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-red-50 dark:bg-red-950/60 text-red-600 dark:text-red-400">
              <AlertTriangle className="w-6 h-6" />
            </div>
            <div>
              <h3 className="font-bold text-zinc-900 dark:text-zinc-100 text-base">
                {t("resolveModal.title")}
              </h3>
              <p className="text-xs text-zinc-500">ID: {report.id}</p>
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

        {/* Report Overview */}
        <div className="space-y-3 bg-zinc-50 dark:bg-zinc-800/40 p-4 rounded-xl border border-zinc-200 dark:border-zinc-800 text-xs">
          <div>
            <span className="text-zinc-500 block mb-0.5">{t("resolveModal.reportedItem")}</span>
            <div className="flex items-center justify-between font-bold text-zinc-900 dark:text-zinc-100 text-sm">
              <span>{report.targetTitle}</span>
              <Link
                href={targetLink}
                target="_blank"
                className="inline-flex items-center gap-1 text-xs text-primary font-semibold hover:underline"
              >
                <span>{report.targetType === "LISTING" ? "Examiner l'annonce" : "Voir concessionnaire"}</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </Link>
            </div>
          </div>

          <div className="pt-2 border-t border-zinc-200 dark:border-zinc-800/80">
            <span className="text-zinc-500 block mb-1">Motif du signalement :</span>
            <span className="inline-flex px-2.5 py-0.5 rounded-full text-xs font-semibold bg-red-100 text-red-800 dark:bg-red-950/50 dark:text-red-300">
              {t(`types.${report.type}` as any)}
            </span>
          </div>

          <div>
            <span className="text-zinc-500 block mb-1">{t("resolveModal.reasonReported")}</span>
            <p className="text-zinc-800 dark:text-zinc-200 bg-white dark:bg-zinc-900 p-3 rounded-lg border border-zinc-200 dark:border-zinc-800 leading-relaxed">
              {report.reason}
            </p>
          </div>

          <div className="flex items-center justify-between text-zinc-500 pt-1 text-[11px]">
            <span>Déclarant : {report.reporterEmail || "Anonyme"}</span>
            <span>{new Date(report.createdAt).toLocaleDateString("fr-FR")}</span>
          </div>
        </div>

        {/* Resolution note */}
        <div className="space-y-1.5">
          <label className="block text-xs font-bold text-zinc-700 dark:text-zinc-300">
            {t("resolveModal.resolutionNote")}
          </label>
          <textarea
            rows={2}
            value={resolutionNote}
            onChange={e => setResolutionNote(e.target.value)}
            placeholder={t("resolveModal.notePlaceholder")}
            className="w-full p-3 rounded-xl border border-zinc-300 dark:border-zinc-700 bg-transparent text-xs text-zinc-900 dark:text-zinc-100 focus:ring-2 focus:ring-primary focus:border-primary resize-none"
          />
        </div>

        {/* Actions */}
        <div className="flex items-center justify-end gap-2 pt-2 border-t border-zinc-200 dark:border-zinc-800">
          <button
            type="button"
            onClick={onClose}
            className="px-3 py-2 text-xs font-semibold text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white"
          >
            {t("resolveModal.close")}
          </button>
          <button
            type="button"
            onClick={() => handleResolve("REJECTED")}
            disabled={loading}
            className="inline-flex items-center gap-1.5 px-4 py-2 bg-zinc-200 hover:bg-zinc-300 dark:bg-zinc-800 dark:hover:bg-zinc-700 text-zinc-800 dark:text-zinc-200 text-xs font-bold rounded-xl transition-colors cursor-pointer disabled:opacity-50"
          >
            {loading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <XCircle className="w-3.5 h-3.5" />}
            <span>{t("resolveModal.rejectBtn")}</span>
          </button>
          <button
            type="button"
            onClick={() => handleResolve("RESOLVED")}
            disabled={loading}
            className="inline-flex items-center gap-1.5 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-xl transition-colors cursor-pointer shadow-xs disabled:opacity-50"
          >
            {loading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <CheckCircle2 className="w-3.5 h-3.5" />}
            <span>{t("resolveModal.resolveBtn")}</span>
          </button>
        </div>
      </div>
    </div>
  );
}
