"use client";

import * as React from "react";
import { X, Check, Store, Clock, MapPin, Globe, Share2, Upload } from "lucide-react";
import { User } from "@/lib/db/schema";
import { updateUserProfile } from "@/lib/actions";
import { useTranslations } from "next-intl";

interface EditProfileModalProps {
  user: User;
  isOpen: boolean;
  onClose: () => void;
}

const DAYS_KEYS = ["monday", "tuesday", "wednesday", "thursday", "friday", "saturday", "sunday"] as const;

export default function EditProfileModal({ user, isOpen, onClose }: EditProfileModalProps) {
  const t = useTranslations("DealerProfile.editModal");
  const tDays = useTranslations("DealerProfile.hours.days");

  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const [success, setSuccess] = React.useState(false);

  const [formData, setFormData] = React.useState({
    dealershipName: user.dealershipName || `${user.firstName} ${user.lastName}`,
    logo: user.logo || "",
    description: user.description || "",
    phone: user.phone || "",
    whatsapp: user.whatsapp || user.phone || "",
    city: user.city || "Kinshasa",
    commune: user.commune || "Gombe",
    address: user.address || "",
    foundedYear: user.foundedYear || 2020,
    website: user.website || "",
    facebook: user.facebook || "",
    instagram: user.instagram || "",
    tiktok: user.tiktok || "",
    businessHours: user.businessHours || {
      monday: "08:00 – 18:00",
      tuesday: "08:00 – 18:00",
      wednesday: "08:00 – 18:00",
      thursday: "08:00 – 18:00",
      friday: "08:00 – 18:00",
      saturday: "09:00 – 16:00",
      sunday: "Fermé",
    },
  });

  if (!isOpen) return null;

  const handleHourChange = (day: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      businessHours: {
        ...prev.businessHours,
        [day]: value,
      },
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      const res = await updateUserProfile(formData);
      if (res.success) {
        setSuccess(true);
        setTimeout(() => {
          setSuccess(false);
          onClose();
        }, 1000);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in">
      <div 
        className="relative w-full max-w-3xl max-h-[90vh] bg-white dark:bg-zinc-900 rounded-2xl shadow-2xl border border-zinc-200 dark:border-zinc-800 flex flex-col overflow-hidden"
        onClick={e => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div className="flex items-center justify-between px-6 py-5 border-b border-zinc-200 dark:border-zinc-800 shrink-0">
          <div>
            <h2 className="text-xl font-bold text-zinc-900 dark:text-zinc-100">{t("title")}</h2>
            <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-0.5">{t("subtitle")}</p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-2 text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200 rounded-lg hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-6 space-y-6">
          {/* Section: Identité */}
          <div className="space-y-4">
            <h3 className="text-sm font-bold uppercase tracking-wider text-primary flex items-center gap-2">
              <Store className="w-4 h-4" />
              Identité du concessionnaire
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300 mb-1.5">
                  {t("dealershipName")}
                </label>
                <input
                  type="text"
                  required
                  value={formData.dealershipName}
                  onChange={e => setFormData({ ...formData, dealershipName: e.target.value })}
                  className="w-full h-11 px-3.5 rounded-lg border border-zinc-300 dark:border-zinc-700 bg-transparent text-sm dark:text-white focus:ring-2 focus:ring-primary"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300 mb-1.5">
                  {t("logoUrl")}
                </label>
                <input
                  type="url"
                  placeholder="https://..."
                  value={formData.logo}
                  onChange={e => setFormData({ ...formData, logo: e.target.value })}
                  className="w-full h-11 px-3.5 rounded-lg border border-zinc-300 dark:border-zinc-700 bg-transparent text-sm dark:text-white focus:ring-2 focus:ring-primary"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300 mb-1.5">
                {t("description")}
              </label>
              <textarea
                rows={3}
                placeholder={t("descriptionPlaceholder")}
                value={formData.description}
                onChange={e => setFormData({ ...formData, description: e.target.value })}
                className="w-full p-3 rounded-lg border border-zinc-300 dark:border-zinc-700 bg-transparent text-sm dark:text-white focus:ring-2 focus:ring-primary resize-none"
              />
            </div>
          </div>

          {/* Section: Coordonnées & Contact */}
          <div className="space-y-4 pt-4 border-t border-zinc-100 dark:border-zinc-800">
            <h3 className="text-sm font-bold uppercase tracking-wider text-primary flex items-center gap-2">
              <MapPin className="w-4 h-4" />
              Contact et localisation
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300 mb-1.5">
                  {t("phone")}
                </label>
                <input
                  type="tel"
                  required
                  value={formData.phone}
                  onChange={e => setFormData({ ...formData, phone: e.target.value })}
                  className="w-full h-11 px-3.5 rounded-lg border border-zinc-300 dark:border-zinc-700 bg-transparent text-sm dark:text-white focus:ring-2 focus:ring-primary"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300 mb-1.5">
                  {t("whatsapp")}
                </label>
                <input
                  type="tel"
                  placeholder="+243..."
                  value={formData.whatsapp}
                  onChange={e => setFormData({ ...formData, whatsapp: e.target.value })}
                  className="w-full h-11 px-3.5 rounded-lg border border-zinc-300 dark:border-zinc-700 bg-transparent text-sm dark:text-white focus:ring-2 focus:ring-primary"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300 mb-1.5">
                  {t("city")}
                </label>
                <input
                  type="text"
                  value={formData.city}
                  onChange={e => setFormData({ ...formData, city: e.target.value })}
                  className="w-full h-11 px-3.5 rounded-lg border border-zinc-300 dark:border-zinc-700 bg-transparent text-sm dark:text-white focus:ring-2 focus:ring-primary"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300 mb-1.5">
                  {t("commune")}
                </label>
                <input
                  type="text"
                  value={formData.commune}
                  onChange={e => setFormData({ ...formData, commune: e.target.value })}
                  className="w-full h-11 px-3.5 rounded-lg border border-zinc-300 dark:border-zinc-700 bg-transparent text-sm dark:text-white focus:ring-2 focus:ring-primary"
                />
              </div>

              <div className="sm:col-span-2">
                <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300 mb-1.5">
                  {t("address")}
                </label>
                <input
                  type="text"
                  placeholder="Ex: Boulevard du 30 Juin, Kinshasa"
                  value={formData.address}
                  onChange={e => setFormData({ ...formData, address: e.target.value })}
                  className="w-full h-11 px-3.5 rounded-lg border border-zinc-300 dark:border-zinc-700 bg-transparent text-sm dark:text-white focus:ring-2 focus:ring-primary"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300 mb-1.5">
                  {t("foundedYear")}
                </label>
                <input
                  type="number"
                  min={1950}
                  max={new Date().getFullYear()}
                  value={formData.foundedYear}
                  onChange={e => setFormData({ ...formData, foundedYear: parseInt(e.target.value) || 2020 })}
                  className="w-full h-11 px-3.5 rounded-lg border border-zinc-300 dark:border-zinc-700 bg-transparent text-sm dark:text-white focus:ring-2 focus:ring-primary"
                />
              </div>
            </div>
          </div>

          {/* Section: Horaires d'ouverture */}
          <div className="space-y-4 pt-4 border-t border-zinc-100 dark:border-zinc-800">
            <h3 className="text-sm font-bold uppercase tracking-wider text-primary flex items-center gap-2">
              <Clock className="w-4 h-4" />
              {t("businessHours")}
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
              {DAYS_KEYS.map(dayKey => (
                <div key={dayKey} className="flex items-center justify-between gap-2 p-2 rounded-lg bg-zinc-50 dark:bg-zinc-800/50 border border-zinc-200 dark:border-zinc-700/60">
                  <span className="font-semibold text-zinc-700 dark:text-zinc-300 w-24">
                    {tDays(dayKey)}
                  </span>
                  <input
                    type="text"
                    value={formData.businessHours?.[dayKey] || "08:00 – 18:00"}
                    onChange={e => handleHourChange(dayKey, e.target.value)}
                    placeholder="08:00 – 18:00 ou Fermé"
                    className="flex-1 h-8 px-2.5 rounded border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-900 text-xs dark:text-white"
                  />
                </div>
              ))}
            </div>
          </div>

          {/* Section: Liens sociaux & Site web */}
          <div className="space-y-4 pt-4 border-t border-zinc-100 dark:border-zinc-800">
            <h3 className="text-sm font-bold uppercase tracking-wider text-primary flex items-center gap-2">
              <Globe className="w-4 h-4" />
              {t("socialLinks")}
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300 mb-1.5">
                  {t("website")}
                </label>
                <input
                  type="url"
                  placeholder="https://mon-garage.cd"
                  value={formData.website}
                  onChange={e => setFormData({ ...formData, website: e.target.value })}
                  className="w-full h-11 px-3.5 rounded-lg border border-zinc-300 dark:border-zinc-700 bg-transparent text-sm dark:text-white focus:ring-2 focus:ring-primary"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300 mb-1.5">
                  {t("facebook")}
                </label>
                <input
                  type="url"
                  placeholder="https://facebook.com/..."
                  value={formData.facebook}
                  onChange={e => setFormData({ ...formData, facebook: e.target.value })}
                  className="w-full h-11 px-3.5 rounded-lg border border-zinc-300 dark:border-zinc-700 bg-transparent text-sm dark:text-white focus:ring-2 focus:ring-primary"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300 mb-1.5">
                  {t("instagram")}
                </label>
                <input
                  type="url"
                  placeholder="https://instagram.com/..."
                  value={formData.instagram}
                  onChange={e => setFormData({ ...formData, instagram: e.target.value })}
                  className="w-full h-11 px-3.5 rounded-lg border border-zinc-300 dark:border-zinc-700 bg-transparent text-sm dark:text-white focus:ring-2 focus:ring-primary"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300 mb-1.5">
                  {t("tiktok")}
                </label>
                <input
                  type="url"
                  placeholder="https://tiktok.com/@..."
                  value={formData.tiktok}
                  onChange={e => setFormData({ ...formData, tiktok: e.target.value })}
                  className="w-full h-11 px-3.5 rounded-lg border border-zinc-300 dark:border-zinc-700 bg-transparent text-sm dark:text-white focus:ring-2 focus:ring-primary"
                />
              </div>
            </div>
          </div>

          {/* Footer Actions */}
          <div className="flex items-center justify-end gap-3 pt-6 border-t border-zinc-200 dark:border-zinc-800">
            <button
              type="button"
              onClick={onClose}
              className="px-5 py-2.5 rounded-xl border border-zinc-300 dark:border-zinc-700 text-sm font-medium text-zinc-700 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"
            >
              {t("cancel")}
            </button>

            <button
              type="submit"
              disabled={isSubmitting}
              className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-primary hover:bg-primary/90 text-white text-sm font-semibold transition-all shadow-sm disabled:opacity-50"
            >
              {success ? (
                <>
                  <Check className="w-4 h-4" /> Enregistré !
                </>
              ) : isSubmitting ? (
                t("saving")
              ) : (
                t("save")
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
