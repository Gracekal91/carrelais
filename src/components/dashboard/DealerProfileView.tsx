"use client";

import * as React from "react";
import Image from "next/image";
import { 
  CheckCircle2, MapPin, Phone, MessageSquare, Mail, Globe, 
  Clock, ShieldCheck, Calendar, Store, Edit3, Share2, AlertTriangle, 
  Eye, Check, ExternalLink, Shield
} from "lucide-react";
import { User, ExtendedVehicleListing } from "@/lib/db/schema";
import { useTranslations } from "next-intl";
import EditProfileModal from "./EditProfileModal";
import ReportDealerModal from "./ReportDealerModal";
import DealerInventorySection from "./DealerInventorySection";
import { Link } from "@/i18n/routing";

interface DealerProfileViewProps {
  user: User;
  activeListings: ExtendedVehicleListing[];
  soldListings?: ExtendedVehicleListing[];
  isOwner?: boolean;
}

const DAYS_ORDER = [
  { key: "monday", label: "Lundi" },
  { key: "tuesday", label: "Mardi" },
  { key: "wednesday", label: "Mercredi" },
  { key: "thursday", label: "Jeudi" },
  { key: "friday", label: "Vendredi" },
  { key: "saturday", label: "Samedi" },
  { key: "sunday", label: "Dimanche" },
] as const;

export default function DealerProfileView({
  user,
  activeListings = [],
  soldListings = [],
  isOwner = false,
}: DealerProfileViewProps) {
  const t = useTranslations("DealerProfile");
  const tDays = useTranslations("DealerProfile.hours.days");

  const [isEditOpen, setIsEditOpen] = React.useState(false);
  const [isReportOpen, setIsReportOpen] = React.useState(false);
  const [copied, setCopied] = React.useState(false);

  // Compute stats from listings
  const totalViews = React.useMemo(() => {
    return [...activeListings, ...soldListings].reduce((acc, curr) => acc + (curr.views || 0), 0);
  }, [activeListings, soldListings]);

  const totalContacts = React.useMemo(() => {
    return [...activeListings, ...soldListings].reduce((acc, curr) => acc + (curr.contacts || 0), 0);
  }, [activeListings, soldListings]);

  const joinedYear = React.useMemo(() => {
    try {
      return new Date(user.joinedAt).getFullYear();
    } catch {
      return 2026;
    }
  }, [user.joinedAt]);

  const dealerName = user.dealershipName || `${user.firstName} ${user.lastName}`;
  const whatsappNumber = (user.whatsapp || user.phone || "").replace(/[^0-9+]/g, "");
  const whatsappUrl = `https://wa.me/${whatsappNumber.replace("+", "")}?text=Bonjour%2C%20je%20vous%20contacte%20depuis%20Car%20Relais.`;

  // Get current day of week
  const todayKey = React.useMemo(() => {
    const dayIdx = new Date().getDay(); // 0 is sunday, 1 is monday, ...
    const map = ["sunday", "monday", "tuesday", "wednesday", "thursday", "friday", "saturday"];
    return map[dayIdx];
  }, []);

  const handleShare = () => {
    if (typeof window !== "undefined") {
      navigator.clipboard.writeText(window.location.href);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  // Avatar initials if no logo
  const initials = dealerName
    .split(" ")
    .map(n => n[0])
    .filter(Boolean)
    .slice(0, 2)
    .join("")
    .toUpperCase();

  return (
    <div className="space-y-10 pb-20">
      {/* 1. PROFILE HEADER */}
      <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-3xl p-6 sm:p-8 md:p-10 shadow-sm relative overflow-hidden">
        {/* Subtle decorative top brand accent */}
        <div className="absolute top-0 left-0 right-0 h-2 bg-gradient-to-r from-primary via-blue-600 to-primary/80" />

        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          {/* Identity Left: Logo / Monogram + Info */}
          <div className="flex flex-col sm:flex-row sm:items-center gap-5">
            {/* Logo / Avatar */}
            <div className="relative w-24 h-24 sm:w-28 sm:h-28 rounded-2xl overflow-hidden bg-zinc-100 dark:bg-zinc-800 border-2 border-zinc-200 dark:border-zinc-700 shrink-0 shadow-inner flex items-center justify-center">
              {user.logo ? (
                <Image
                  src={user.logo}
                  alt={dealerName}
                  fill
                  className="object-cover"
                />
              ) : (
                <span className="text-3xl font-extrabold text-primary tracking-wider font-mono">
                  {initials || "CR"}
                </span>
              )}
            </div>

            {/* Title, Badge & Location */}
            <div className="space-y-2">
              <div className="flex items-center flex-wrap gap-2.5">
                <h1 className="text-2xl sm:text-3xl font-extrabold text-zinc-900 dark:text-zinc-50 tracking-tight">
                  {dealerName}
                </h1>
              </div>

              {/* Verification Badge */}
              <div className="flex items-center gap-2 flex-wrap">
                {user.isVerified ? (
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-blue-50 text-blue-700 dark:bg-blue-950/70 dark:text-blue-300 border border-blue-200 dark:border-blue-900/60 shadow-xs">
                    <CheckCircle2 className="w-4 h-4 text-blue-600 dark:text-blue-400 shrink-0" />
                    {t("verifiedDealership")}
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400">
                    <Store className="w-3.5 h-3.5" />
                    {user.accountType === "DEALERSHIP" ? t("dealership") : t("privateSeller")}
                  </span>
                )}

                {/* Member Since Badge */}
                <span className="text-xs text-zinc-500 dark:text-zinc-400 font-medium">
                  • {t("trust.memberSince", { year: joinedYear })}
                </span>
              </div>

              {/* Location */}
              <div className="flex items-center gap-1.5 text-sm text-zinc-600 dark:text-zinc-300">
                <MapPin className="w-4 h-4 text-primary shrink-0" />
                <span className="font-medium">
                  {user.address ? `${user.address} • ` : ""}
                  {user.commune ? `${user.commune}, ` : ""}
                  {user.city || user.location || "Kinshasa, RDC"}
                </span>
              </div>
            </div>
          </div>

          {/* Action Right: Modifier le profil (if owner) & Partager */}
          <div className="flex items-center gap-3 pt-4 md:pt-0 border-t md:border-t-0 border-zinc-100 dark:border-zinc-800">
            <button
              type="button"
              onClick={handleShare}
              className="p-2.5 rounded-xl border border-zinc-200 dark:border-zinc-800 hover:bg-zinc-100 dark:hover:bg-zinc-800 text-zinc-600 dark:text-zinc-300 transition-colors"
              title={t("contact.share")}
            >
              {copied ? <Check className="w-5 h-5 text-green-600" /> : <Share2 className="w-5 h-5" />}
            </button>

            {isOwner && (
              <button
                type="button"
                onClick={() => setIsEditOpen(true)}
                className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-zinc-900 hover:bg-zinc-800 dark:bg-zinc-100 dark:hover:bg-white text-white dark:text-zinc-900 text-sm font-semibold transition-all shadow-xs"
              >
                <Edit3 className="w-4 h-4" />
                {t("editProfile")}
              </button>
            )}
          </div>
        </div>

        {/* 2. PRIMARY CONTACT ACTIONS (prominent bar) */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5 mt-8 pt-6 border-t border-zinc-100 dark:border-zinc-800">
          {/* WhatsApp */}
          <a
            href={whatsappUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center justify-center gap-2.5 h-12 px-5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-sm font-bold shadow-xs hover:shadow transition-all"
          >
            <MessageSquare className="w-4 h-4" />
            {t("contact.whatsapp")}
          </a>

          {/* Call Phone */}
          <a
            href={`tel:${user.phone}`}
            className="flex items-center justify-center gap-2.5 h-12 px-5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-sm font-bold shadow-xs hover:shadow transition-all"
          >
            <Phone className="w-4 h-4" />
            {t("contact.call")} ({user.phone})
          </a>

          {/* Email / Message */}
          <a
            href={`mailto:${user.email}?subject=Car%20Relais%20Inquiry`}
            className="flex items-center justify-center gap-2.5 h-12 px-5 rounded-xl bg-zinc-100 dark:bg-zinc-800 hover:bg-zinc-200 dark:hover:bg-zinc-700 text-zinc-900 dark:text-zinc-100 text-sm font-semibold transition-all border border-zinc-200 dark:border-zinc-700"
          >
            <Mail className="w-4 h-4" />
            {t("contact.message")}
          </a>
        </div>
      </div>

      {/* 3. DEALER STATISTICS ROW */}
      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
        <div className="bg-white dark:bg-zinc-900 p-5 rounded-2xl border border-zinc-200 dark:border-zinc-800 shadow-xs">
          <span className="text-xs font-semibold text-zinc-500 uppercase tracking-wider block mb-1">
            {t("stats.activeVehicles")}
          </span>
          <span className="text-3xl font-black text-primary">
            {activeListings.length}
          </span>
        </div>

        <div className="bg-white dark:bg-zinc-900 p-5 rounded-2xl border border-zinc-200 dark:border-zinc-800 shadow-xs">
          <span className="text-xs font-semibold text-zinc-500 uppercase tracking-wider block mb-1 flex items-center gap-1.5">
            <Eye className="w-3.5 h-3.5" />
            {t("stats.totalViews")}
          </span>
          <span className="text-3xl font-black text-blue-600 dark:text-blue-400">
            {totalViews.toLocaleString()}
          </span>
        </div>

        <div className="col-span-2 md:col-span-1 bg-white dark:bg-zinc-900 p-5 rounded-2xl border border-zinc-200 dark:border-zinc-800 shadow-xs">
          <span className="text-xs font-semibold text-zinc-500 uppercase tracking-wider block mb-1 flex items-center gap-1.5">
            <MessageSquare className="w-3.5 h-3.5" />
            {t("stats.totalContacts")}
          </span>
          <span className="text-3xl font-black text-emerald-600 dark:text-emerald-400">
            {totalContacts.toLocaleString()}
          </span>
        </div>
      </div>

      {/* 4. MAIN CONTENT TWO-COLUMN GRID: LEFT (About & Inventory) | RIGHT (Sidebar details) */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
        {/* LEFT COLUMN: About + Active Vehicles Inventory */}
        <div className="lg:col-span-2 space-y-10">
          {/* About Section */}
          <div className="bg-white dark:bg-zinc-900 p-6 sm:p-8 rounded-3xl border border-zinc-200 dark:border-zinc-800 shadow-xs space-y-4">
            <h2 className="text-xl font-bold text-zinc-900 dark:text-zinc-100 flex items-center gap-2.5">
              <span className="w-2.5 h-2.5 rounded-full bg-primary" />
              {t("about.title")}
            </h2>
            <p className="text-sm sm:text-base text-zinc-600 dark:text-zinc-300 leading-relaxed whitespace-pre-line">
              {user.description || t("about.noDescription")}
            </p>
          </div>

          {/* 6. VEHICLES FOR SALE (with filter & card grid) */}
          <DealerInventorySection
            activeVehicles={activeListings}
            soldVehicles={soldListings}
          />
        </div>

        {/* RIGHT COLUMN: Sidebar (Details, Hours, Location, Socials, Trust) */}
        <div className="space-y-6">
          {/* Structured Dealership Details */}
          <div className="bg-white dark:bg-zinc-900 p-6 rounded-3xl border border-zinc-200 dark:border-zinc-800 shadow-xs space-y-4">
            <h3 className="text-base font-bold text-zinc-900 dark:text-zinc-100 border-b border-zinc-100 dark:border-zinc-800 pb-3 flex items-center gap-2">
              <Store className="w-4 h-4 text-primary" />
              {t("details.title")}
            </h3>

            <div className="space-y-3.5 text-xs sm:text-sm">
              <div className="flex items-center justify-between gap-2">
                <span className="text-zinc-500">{t("details.companyName")}</span>
                <span className="font-semibold text-zinc-900 dark:text-zinc-100 text-right">{dealerName}</span>
              </div>

              <div className="flex items-center justify-between gap-2">
                <span className="text-zinc-500">{t("details.sellerType")}</span>
                <span className="font-semibold text-zinc-900 dark:text-zinc-100 text-right">
                  {user.accountType === "DEALERSHIP" ? t("dealership") : t("privateSeller")}
                </span>
              </div>

              {user.foundedYear && (
                <div className="flex items-center justify-between gap-2">
                  <span className="text-zinc-500">{t("details.foundedYear")}</span>
                  <span className="font-semibold text-zinc-900 dark:text-zinc-100 text-right">{user.foundedYear}</span>
                </div>
              )}

              <div className="flex items-center justify-between gap-2">
                <span className="text-zinc-500">{t("details.city")}</span>
                <span className="font-semibold text-zinc-900 dark:text-zinc-100 text-right">{user.city || "Kinshasa"}</span>
              </div>

              {user.commune && (
                <div className="flex items-center justify-between gap-2">
                  <span className="text-zinc-500">{t("details.commune")}</span>
                  <span className="font-semibold text-zinc-900 dark:text-zinc-100 text-right">{user.commune}</span>
                </div>
              )}

              {user.phone && (
                <div className="flex items-center justify-between gap-2">
                  <span className="text-zinc-500">{t("details.phone")}</span>
                  <a href={`tel:${user.phone}`} className="font-semibold text-blue-600 hover:underline text-right">
                    {user.phone}
                  </a>
                </div>
              )}

              {user.email && (
                <div className="flex items-center justify-between gap-2">
                  <span className="text-zinc-500">{t("details.email")}</span>
                  <a href={`mailto:${user.email}`} className="font-semibold text-blue-600 hover:underline text-right truncate max-w-[180px]">
                    {user.email}
                  </a>
                </div>
              )}
            </div>
          </div>

          {/* Business Hours */}
          {user.businessHours && (
            <div className="bg-white dark:bg-zinc-900 p-6 rounded-3xl border border-zinc-200 dark:border-zinc-800 shadow-xs space-y-4">
              <h3 className="text-base font-bold text-zinc-900 dark:text-zinc-100 border-b border-zinc-100 dark:border-zinc-800 pb-3 flex items-center gap-2">
                <Clock className="w-4 h-4 text-primary" />
                {t("hours.title")}
              </h3>

              <div className="space-y-2.5 text-xs">
                {DAYS_ORDER.map(({ key }) => {
                  const isToday = key === todayKey;
                  const time = user.businessHours?.[key] || "08:00 – 18:00";
                  return (
                    <div
                      key={key}
                      className={`flex items-center justify-between py-1 px-2 rounded-lg transition-colors ${
                        isToday
                          ? "bg-primary/10 text-primary font-bold"
                          : "text-zinc-600 dark:text-zinc-400 font-medium"
                      }`}
                    >
                      <span className="flex items-center gap-2">
                        {tDays(key as any)}
                        {isToday && (
                          <span className="text-[10px] px-1.5 py-0.2 bg-primary text-white rounded font-bold uppercase">
                            {t("hours.today")}
                          </span>
                        )}
                      </span>
                      <span>{time}</span>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Location Section */}
          <div className="bg-white dark:bg-zinc-900 p-6 rounded-3xl border border-zinc-200 dark:border-zinc-800 shadow-xs space-y-4">
            <h3 className="text-base font-bold text-zinc-900 dark:text-zinc-100 border-b border-zinc-100 dark:border-zinc-800 pb-3 flex items-center gap-2">
              <MapPin className="w-4 h-4 text-primary" />
              {t("location.title")}
            </h3>

            <div className="space-y-3 text-xs sm:text-sm">
              <div className="p-4 rounded-xl bg-zinc-50 dark:bg-zinc-800/60 border border-zinc-100 dark:border-zinc-800">
                <p className="font-bold text-zinc-900 dark:text-zinc-100 mb-1">
                  {user.address || "Zone Commerciale"}
                </p>
                <p className="text-zinc-500 dark:text-zinc-400 text-xs">
                  {user.commune ? `${user.commune}, ` : ""}{user.city || "Kinshasa"}, République Démocratique du Congo
                </p>
              </div>

              <span className="inline-block text-[11px] font-semibold text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/40 px-3 py-1 rounded-full border border-emerald-200 dark:border-emerald-900/50">
                📍 {t("location.drcBadge")}
              </span>
            </div>
          </div>

          {/* Social / Website Links */}
          {(user.website || user.facebook || user.instagram || user.tiktok) && (
            <div className="bg-white dark:bg-zinc-900 p-6 rounded-3xl border border-zinc-200 dark:border-zinc-800 shadow-xs space-y-4">
              <h3 className="text-base font-bold text-zinc-900 dark:text-zinc-100 border-b border-zinc-100 dark:border-zinc-800 pb-3 flex items-center gap-2">
                <Globe className="w-4 h-4 text-primary" />
                {t("social.title")}
              </h3>

              <div className="flex flex-wrap gap-2.5">
                {user.website && (
                  <a
                    href={user.website}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-zinc-100 dark:bg-zinc-800 hover:bg-zinc-200 dark:hover:bg-zinc-700 text-xs font-semibold text-zinc-800 dark:text-zinc-200 transition-colors"
                  >
                    <Globe className="w-3.5 h-3.5 text-blue-500" />
                    {t("social.website")}
                    <ExternalLink className="w-3 h-3 text-zinc-400" />
                  </a>
                )}

                {user.facebook && (
                  <a
                    href={user.facebook}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-zinc-100 dark:bg-zinc-800 hover:bg-zinc-200 dark:hover:bg-zinc-700 text-xs font-semibold text-zinc-800 dark:text-zinc-200 transition-colors"
                  >
                    Facebook
                    <ExternalLink className="w-3 h-3 text-zinc-400" />
                  </a>
                )}

                {user.instagram && (
                  <a
                    href={user.instagram}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-zinc-100 dark:bg-zinc-800 hover:bg-zinc-200 dark:hover:bg-zinc-700 text-xs font-semibold text-zinc-800 dark:text-zinc-200 transition-colors"
                  >
                    Instagram
                    <ExternalLink className="w-3 h-3 text-zinc-400" />
                  </a>
                )}

                {user.tiktok && (
                  <a
                    href={user.tiktok}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-zinc-100 dark:bg-zinc-800 hover:bg-zinc-200 dark:hover:bg-zinc-700 text-xs font-semibold text-zinc-800 dark:text-zinc-200 transition-colors"
                  >
                    TikTok
                    <ExternalLink className="w-3 h-3 text-zinc-400" />
                  </a>
                )}
              </div>
            </div>
          )}

          {/* Trust Information */}
          <div className="bg-zinc-50 dark:bg-zinc-800/40 p-6 rounded-3xl border border-zinc-200/80 dark:border-zinc-800/80 space-y-3 text-xs">
            <h4 className="font-bold text-zinc-900 dark:text-zinc-100 uppercase tracking-wider text-[11px] flex items-center gap-1.5">
              <ShieldCheck className="w-4 h-4 text-primary" />
              Garanties et sécurité Car Relais
            </h4>

            <div className="space-y-2 text-zinc-600 dark:text-zinc-400">
              {user.isVerified && (
                <div className="flex items-center gap-2 text-blue-600 dark:text-blue-400 font-medium">
                  <Check className="w-3.5 h-3.5" />
                  {t("trust.verifiedIdentity")}
                </div>
              )}
              {user.phone && (
                <div className="flex items-center gap-2 text-emerald-600 dark:text-emerald-400 font-medium">
                  <Check className="w-3.5 h-3.5" />
                  {t("trust.verifiedPhone")}
                </div>
              )}
              {user.email && (
                <div className="flex items-center gap-2 text-emerald-600 dark:text-emerald-400 font-medium">
                  <Check className="w-3.5 h-3.5" />
                  {t("trust.verifiedEmail")}
                </div>
              )}
            </div>

            {/* Subtle report action */}
            <div className="pt-3 border-t border-zinc-200/70 dark:border-zinc-700/60">
              <button
                type="button"
                onClick={() => setIsReportOpen(true)}
                className="text-[11px] text-zinc-400 hover:text-red-500 transition-colors flex items-center gap-1.5"
              >
                <AlertTriangle className="w-3.5 h-3.5" />
                {t("report.button")}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Edit Profile Modal */}
      {isOwner && (
        <EditProfileModal
          user={user}
          isOpen={isEditOpen}
          onClose={() => setIsEditOpen(false)}
        />
      )}

      {/* Report Dealer Modal */}
      <ReportDealerModal
        dealerName={dealerName}
        isOpen={isReportOpen}
        onClose={() => setIsReportOpen(false)}
      />
    </div>
  );
}
