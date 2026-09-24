"use client";

import { useEffect } from "react";
import { incrementAnalytics } from "@/lib/actions";
import { MessageCircle, Phone, ExternalLink } from "lucide-react";
import { Button } from "@/components/ui/Button";

export function VehicleViewTracker({ listingId }: { listingId: string }) {
  useEffect(() => {
    // Increment view once per mount
    incrementAnalytics(listingId, "views").catch(console.error);
  }, [listingId]);

  return null;
}

interface VehicleContactButtonsProps {
  listingId: string;
  whatsappLabel: string;
  callLabel: string;
  vehicleTitle?: string;
  phone?: string;
  whatsapp?: string;
  source?: string;
  sourceUrl?: string;
  contactOptions?: {
    allowCalls?: boolean;
    allowWhatsapp?: boolean;
    allowDirectMessage?: boolean;
    whatsappNumber?: string;
    callNumber?: string;
    showPhoneNumber?: boolean;
  };
  phoneLabel?: string;
}

function cleanPhoneForWhatsApp(rawNumber?: string): string {
  if (!rawNumber) return "";
  let cleaned = rawNumber.replace(/[^0-9]/g, "");
  if (cleaned.startsWith("0") && cleaned.length === 10) {
    // Standard DRC format: 0812345678 -> 243812345678
    cleaned = "243" + cleaned.slice(1);
  }
  return cleaned;
}

export function VehicleContactButtons({
  listingId,
  whatsappLabel,
  callLabel,
  vehicleTitle,
  phone,
  whatsapp,
  source,
  sourceUrl,
  contactOptions,
  phoneLabel = "Tél",
}: VehicleContactButtonsProps) {
  const allowWhatsapp = contactOptions?.allowWhatsapp !== false;
  const allowCalls = contactOptions?.allowCalls !== false;
  const showPhoneNumber = contactOptions?.showPhoneNumber !== false;

  const targetWhatsapp = contactOptions?.whatsappNumber || whatsapp || phone;
  const targetPhone = contactOptions?.callNumber || phone;
  const cleanWhatsappNumber = cleanPhoneForWhatsApp(targetWhatsapp);
  const cleanPhoneNumber = targetPhone?.replace(/[^0-9+]/g, "") || cleanWhatsappNumber;
  const displayPhoneNumber = targetPhone || (cleanPhoneNumber ? `+${cleanPhoneNumber.replace(/^\+/, "")}` : "");
  const displayWhatsappNumber = targetWhatsapp;

  const handleChat = async () => {
    await incrementAnalytics(listingId, "chats").catch(console.error);
    if (cleanWhatsappNumber) {
      const msg = encodeURIComponent(`Bonjour, je vous contacte depuis Car Relais concernant votre annonce : ${vehicleTitle || "véhicule"}. Est-il toujours disponible ?`);
      window.open(`https://wa.me/${cleanWhatsappNumber}?text=${msg}`, "_blank");
    } else {
      alert("Numéro WhatsApp non renseigné.");
    }
  };

  const handleCall = async () => {
    await incrementAnalytics(listingId, "phoneClicks").catch(console.error);
    if (cleanPhoneNumber) {
      window.location.href = `tel:${cleanPhoneNumber}`;
    } else {
      alert("Numéro de téléphone non renseigné.");
    }
  };

  const handleSourceClick = async () => {
    await incrementAnalytics(listingId, "contacts").catch(console.error);
    if (sourceUrl) {
      window.open(sourceUrl, "_blank", "noopener,noreferrer");
    }
  };

  const getSourceDetails = (src?: string) => {
    switch (src?.toUpperCase()) {
      case "FACEBOOK":
        return {
          label: "Voir & Contacter sur Facebook",
          bg: "bg-[#1877F2] hover:bg-[#166fe5] text-white",
          icon: (
            <svg className="w-5 h-5 fill-current shrink-0" viewBox="0 0 24 24">
              <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
            </svg>
          ),
        };
      case "TIKTOK":
        return {
          label: "Voir & Contacter sur TikTok",
          bg: "bg-black hover:bg-zinc-800 text-white border border-zinc-700",
          icon: (
            <svg className="w-5 h-5 fill-current shrink-0" viewBox="0 0 24 24">
              <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-5.2 1.74 2.89 2.89 0 0 1 2.31-4.64c.298-.002.595.042.88.13V9.4a6.33 6.33 0 0 0-1-.08A6.34 6.34 0 0 0 3 15.66a6.34 6.34 0 0 0 10.82 4.49 6.3 6.3 0 0 0 1.88-4.48V8.62a8.28 8.28 0 0 0 4.89 1.58V6.75a4.85 4.85 0 0 1-1-.06z" />
            </svg>
          ),
        };
      case "INSTAGRAM":
        return {
          label: "Voir & Contacter sur Instagram",
          bg: "bg-gradient-to-r from-[#833ab4] via-[#fd1d1d] to-[#fcb045] text-white hover:opacity-95",
          icon: (
            <svg className="w-5 h-5 fill-current shrink-0" viewBox="0 0 24 24">
              <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z" />
            </svg>
          ),
        };
      default:
        return {
          label: "Voir la publication originale",
          bg: "bg-zinc-800 hover:bg-zinc-900 text-white",
          icon: <ExternalLink className="w-5 h-5 shrink-0" />,
        };
    }
  };

  const sourceDetails = sourceUrl ? getSourceDetails(source) : null;

  return (
    <div className="pt-4 grid gap-3">
      {/* Direct Source / Original Post Contact Link */}
      {sourceUrl && sourceDetails && (
        <a
          href={sourceUrl}
          target="_blank"
          rel="noopener noreferrer"
          onClick={handleSourceClick}
          className={`w-full lg:w-[90%] py-3.5 px-4 rounded-xl font-semibold flex items-center justify-center gap-2.5 transition-all shadow-sm active:scale-[0.98] ${sourceDetails.bg}`}
        >
          {sourceDetails.icon}
          <span className="truncate">{sourceDetails.label}</span>
          <ExternalLink className="w-4 h-4 ml-auto shrink-0 opacity-70" />
        </a>
      )}

      {/* WhatsApp Button */}
      {allowWhatsapp && (
        <Button
          onClick={handleChat}
          size="lg"
          className="w-full lg:w-[90%] flex items-center justify-center gap-2 text-base font-semibold bg-green-600 hover:bg-green-700 text-white shadow-sm"
        >
          <MessageCircle className="w-5 h-5" />
          <span>{whatsappLabel}</span>
        </Button>
      )}

      {/* Phone Call Button */}
      {allowCalls && (
        <Button
          onClick={handleCall}
          size="lg"
          variant="outline"
          className="w-full lg:w-[90%] flex items-center justify-center gap-2 text-base font-semibold border-zinc-200 dark:border-zinc-700 hover:bg-zinc-50 dark:hover:bg-zinc-800"
        >
          <Phone className="w-5 h-5" />
          <span>{callLabel}</span>
        </Button>
      )}

      {/* Display Phone Number & WhatsApp directly when showPhoneNumber is enabled */}
      {showPhoneNumber && (displayPhoneNumber || displayWhatsappNumber) && (
        <div className="w-full lg:w-[90%] p-3 rounded-xl bg-zinc-50 dark:bg-zinc-800/60 border border-zinc-200/80 dark:border-zinc-700/80 text-xs space-y-2 mt-0.5">
          {displayPhoneNumber && (
            <div className="flex items-center justify-between gap-2">
              <span className="text-zinc-500 dark:text-zinc-400 flex items-center gap-1.5">
                <Phone className="w-3.5 h-3.5 text-zinc-400" />
                {phoneLabel} :
              </span>
              <a
                href={`tel:${cleanPhoneNumber}`}
                className="font-mono font-bold text-zinc-900 dark:text-zinc-100 hover:text-primary transition-colors select-all"
              >
                {displayPhoneNumber}
              </a>
            </div>
          )}
          {displayWhatsappNumber && displayWhatsappNumber !== displayPhoneNumber && (
            <div className="flex items-center justify-between gap-2">
              <span className="text-zinc-500 dark:text-zinc-400 flex items-center gap-1.5">
                <MessageCircle className="w-3.5 h-3.5 text-emerald-500" />
                WhatsApp :
              </span>
              <a
                href={`https://wa.me/${cleanWhatsappNumber}`}
                target="_blank"
                rel="noopener noreferrer"
                className="font-mono font-bold text-emerald-600 dark:text-emerald-400 hover:underline transition-colors select-all"
              >
                {displayWhatsappNumber}
              </a>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
