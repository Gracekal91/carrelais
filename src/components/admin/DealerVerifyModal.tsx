"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import { 
  Store, 
  ShieldCheck, 
  ShieldAlert, 
  X, 
  MapPin, 
  Phone, 
  Mail, 
  ExternalLink, 
  Loader2,
  CheckCircle2
} from "lucide-react";
import { User } from "@/lib/db/schema";
import { toggleDealerVerificationAction } from "@/lib/actions";
import Link from "next/link";

interface DealerVerifyModalProps {
  dealer: User | null;
  isOpen: boolean;
  onClose: () => void;
}

export default function DealerVerifyModal({ dealer, isOpen, onClose }: DealerVerifyModalProps) {
  const t = useTranslations("AdminPortal.dealers.verifyModal");
  const router = useRouter();
  const [loading, setLoading] = React.useState(false);
  const [feedback, setFeedback] = React.useState<string | null>(null);

  if (!isOpen || !dealer) return null;

  const isVerified = Boolean(dealer.isVerified);

  const handleToggleVerification = async (verify: boolean) => {
    setLoading(true);
    setFeedback(null);
    try {
      const res = await toggleDealerVerificationAction(dealer.id, verify);
      if (res.success) {
        setFeedback(verify ? t("verifySuccess") : t("unverifySuccess"));
        router.refresh();
        setTimeout(() => {
          onClose();
        }, 1200);
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in">
      <div 
        className="relative w-full max-w-lg bg-white dark:bg-zinc-900 rounded-2xl shadow-2xl border border-zinc-200 dark:border-zinc-800 p-6 space-y-5"
        onClick={e => e.stopPropagation()}
      >
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            <div className={`p-2.5 rounded-xl ${
              isVerified ? "bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400" : "bg-amber-50 dark:bg-amber-950/60 text-amber-600 dark:text-amber-400"
            }`}>
              {isVerified ? <ShieldCheck className="w-6 h-6" /> : <ShieldAlert className="w-6 h-6" />}
            </div>
            <div>
              <h3 className="font-bold text-zinc-900 dark:text-zinc-100 text-base">
                {dealer.dealershipName || `${dealer.firstName} ${dealer.lastName}`}
              </h3>
              <p className="text-xs text-zinc-500">{t("title")}</p>
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

        {feedback && (
          <div className="p-3 bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 rounded-xl text-xs font-semibold text-emerald-800 dark:text-emerald-300 flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4" />
            <span>{feedback}</span>
          </div>
        )}

        <div className="space-y-3 text-xs bg-zinc-50 dark:bg-zinc-800/40 p-4 rounded-xl border border-zinc-200 dark:border-zinc-800">
          <div className="flex items-center justify-between">
            <span className="text-zinc-500">Statut de vérification :</span>
            <span className={`font-bold px-2.5 py-0.5 rounded-full ${
              isVerified ? "bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300" : "bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300"
            }`}>
              {isVerified ? t("verifiedBadge") : t("unverifiedBadge")}
            </span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-zinc-500">Responsable / Contact :</span>
            <span className="font-medium text-zinc-800 dark:text-zinc-200">{dealer.firstName} {dealer.lastName}</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-zinc-500">Téléphone :</span>
            <span className="font-medium text-zinc-800 dark:text-zinc-200">{dealer.phone}</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-zinc-500">Localisation :</span>
            <span className="font-medium text-zinc-800 dark:text-zinc-200">{dealer.location || "Kinshasa, RDC"}</span>
          </div>
          {dealer.website && (
            <div className="flex items-center justify-between">
              <span className="text-zinc-500">Site web :</span>
              <a href={dealer.website} target="_blank" rel="noopener noreferrer" className="text-primary hover:underline font-medium">
                {dealer.website}
              </a>
            </div>
          )}
        </div>

        <p className="text-xs text-zinc-600 dark:text-zinc-400 leading-relaxed">
          {t("description")}
        </p>

        <div className="flex items-center justify-between pt-3 border-t border-zinc-200 dark:border-zinc-800">
          <Link
            href={`/dealers/${dealer.id}`}
            target="_blank"
            className="inline-flex items-center gap-1.5 text-xs text-primary font-semibold hover:underline"
          >
            <span>{t("viewStorefront")}</span>
            <ExternalLink className="w-3.5 h-3.5" />
          </Link>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-3 py-2 text-xs font-semibold text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white"
            >
              {t("close")}
            </button>
            {isVerified ? (
              <button
                type="button"
                onClick={() => handleToggleVerification(false)}
                disabled={loading}
                className="inline-flex items-center gap-1.5 px-4 py-2 bg-red-600 hover:bg-red-700 text-white text-xs font-bold rounded-xl transition-colors cursor-pointer disabled:opacity-50"
              >
                {loading && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                <span>{t("unverifyBtn")}</span>
              </button>
            ) : (
              <button
                type="button"
                onClick={() => handleToggleVerification(true)}
                disabled={loading}
                className="inline-flex items-center gap-1.5 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-xl transition-colors cursor-pointer shadow-xs disabled:opacity-50"
              >
                {loading && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                <span>{t("verifyBtn")}</span>
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
