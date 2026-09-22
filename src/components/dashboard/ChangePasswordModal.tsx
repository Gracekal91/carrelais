"use client";

import { useState } from "react";
import { requestChangePasswordOtp, changePasswordWithOtp } from "@/lib/actions";
import { Lock, X, CheckCircle2, AlertCircle, Loader2, KeyRound, ShieldCheck } from "lucide-react";

interface ChangePasswordModalProps {
  isOpen: boolean;
  onClose: () => void;
  userEmail: string;
}

export default function ChangePasswordModal({ isOpen, onClose, userEmail }: ChangePasswordModalProps) {
  const [pinSent, setPinSent] = useState(false);
  const [pin, setPin] = useState("");
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const [isSendingPin, setIsSendingPin] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isOpen) return null;

  const handleRequestPin = async () => {
    setIsSendingPin(true);
    setError("");
    try {
      const res = await requestChangePasswordOtp();
      if (res.success) {
        setPinSent(true);
      } else {
        setError(res.error || "Erreur lors de l'envoi du code PIN.");
      }
    } catch {
      setError("Erreur de connexion. Veuillez réessayer.");
    } finally {
      setIsSendingPin(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!pin.trim() || !currentPassword || !newPassword) {
      setError("Tous les champs sont requis.");
      return;
    }

    if (newPassword.length < 6) {
      setError("Le nouveau mot de passe doit comporter au moins 6 caractères.");
      return;
    }

    if (newPassword !== confirmPassword) {
      setError("Les deux mots de passe ne correspondent pas.");
      return;
    }

    setIsSubmitting(true);

    try {
      const res = await changePasswordWithOtp(pin.trim(), currentPassword, newPassword);
      if (res.success) {
        setSuccess(true);
        setTimeout(() => {
          onClose();
          setSuccess(false);
          setPinSent(false);
          setPin("");
          setCurrentPassword("");
          setNewPassword("");
          setConfirmPassword("");
        }, 1600);
      } else {
        setError(res.error || "Échec de la modification du mot de passe.");
      }
    } catch {
      setError("Une erreur est survenue lors de la mise à jour.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
      <div className="relative w-full max-w-md bg-white dark:bg-zinc-900 rounded-2xl shadow-2xl border border-zinc-200 dark:border-zinc-800 p-6 sm:p-8">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200 rounded-full hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-3 mb-5">
          <div className="w-10 h-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center">
            <Lock className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-zinc-900 dark:text-zinc-100">
              Modifier le mot de passe
            </h2>
            <p className="text-xs text-zinc-500">Sécurité du compte</p>
          </div>
        </div>

        {error && (
          <div className="p-3 mb-4 bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-900/40 rounded-xl text-red-600 dark:text-red-400 text-xs font-medium flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {success ? (
          <div className="py-8 text-center space-y-3">
            <div className="w-14 h-14 bg-emerald-50 text-emerald-600 rounded-full flex items-center justify-center mx-auto">
              <CheckCircle2 className="w-8 h-8 animate-bounce text-emerald-600" />
            </div>
            <h3 className="text-base font-bold text-zinc-900 dark:text-zinc-100">
              Mot de passe mis à jour !
            </h3>
            <p className="text-xs text-zinc-500">
              Votre mot de passe a été modifié avec succès.
            </p>
          </div>
        ) : !pinSent ? (
          <div className="space-y-4 py-2">
            <div className="p-4 bg-zinc-50 dark:bg-zinc-800/50 rounded-xl border border-zinc-200 dark:border-zinc-700/60 text-xs text-zinc-600 dark:text-zinc-300 leading-relaxed">
              <p className="mb-2 font-medium flex items-center gap-1.5 text-zinc-900 dark:text-zinc-100">
                <ShieldCheck className="w-4 h-4 text-emerald-600" />
                Vérification de sécurité obligatoire
              </p>
              Pour protéger votre compte, un code PIN à 6 chiffres doit être envoyé à votre adresse email :
              <strong className="block mt-1 text-primary">{userEmail}</strong>
            </div>

            <button
              onClick={handleRequestPin}
              disabled={isSendingPin}
              className="w-full h-11 bg-primary text-white font-semibold rounded-xl hover:bg-primary/90 transition-colors shadow-sm disabled:opacity-50 flex items-center justify-center gap-2 cursor-pointer"
            >
              {isSendingPin ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Envoi du code PIN...</span>
                </>
              ) : (
                <>
                  <KeyRound className="w-4 h-4" />
                  <span>Envoyer le code PIN à mon email</span>
                </>
              )}
            </button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-3.5">
            <div className="p-3 bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-900/40 rounded-xl text-emerald-800 dark:text-emerald-200 text-xs">
              Code PIN envoyé à <strong>{userEmail}</strong>.
            </div>

            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="block text-xs font-semibold uppercase tracking-wider text-zinc-600 dark:text-zinc-400">
                  Code PIN (6 chiffres)
                </label>
                <button
                  type="button"
                  onClick={handleRequestPin}
                  disabled={isSendingPin}
                  className="text-[11px] text-primary hover:underline font-medium"
                >
                  {isSendingPin ? "Envoi..." : "Renvoyer"}
                </button>
              </div>
              <input
                type="text"
                inputMode="numeric"
                maxLength={6}
                value={pin}
                onChange={(e) => setPin(e.target.value.replace(/[^0-9]/g, "").slice(0, 6))}
                required
                placeholder="123456"
                className="w-full h-11 text-center tracking-[6px] text-lg font-bold font-mono border border-zinc-300 dark:border-zinc-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20 dark:bg-zinc-800"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-zinc-600 dark:text-zinc-400 mb-1">
                Mot de passe actuel
              </label>
              <input
                type="password"
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                required
                placeholder="••••••••"
                className="w-full h-10 px-3 border border-zinc-300 dark:border-zinc-700 rounded-xl text-sm dark:bg-zinc-800 focus:outline-none focus:ring-2 focus:ring-primary/20"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-zinc-600 dark:text-zinc-400 mb-1">
                Nouveau mot de passe
              </label>
              <input
                type="password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                required
                placeholder="••••••••"
                className="w-full h-10 px-3 border border-zinc-300 dark:border-zinc-700 rounded-xl text-sm dark:bg-zinc-800 focus:outline-none focus:ring-2 focus:ring-primary/20"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-zinc-600 dark:text-zinc-400 mb-1">
                Confirmer le nouveau mot de passe
              </label>
              <input
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
                placeholder="••••••••"
                className="w-full h-10 px-3 border border-zinc-300 dark:border-zinc-700 rounded-xl text-sm dark:bg-zinc-800 focus:outline-none focus:ring-2 focus:ring-primary/20"
              />
            </div>

            <div className="pt-2 flex gap-3">
              <button
                type="button"
                onClick={onClose}
                className="flex-1 h-10 border border-zinc-300 dark:border-zinc-700 rounded-xl text-xs font-semibold text-zinc-700 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800"
              >
                Annuler
              </button>
              <button
                type="submit"
                disabled={isSubmitting || pin.length < 6 || !currentPassword || !newPassword}
                className="flex-1 h-10 bg-primary text-white text-xs font-semibold rounded-xl hover:bg-primary/90 transition-colors shadow-sm disabled:opacity-50 flex items-center justify-center gap-1.5 cursor-pointer"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    <span>Mise à jour...</span>
                  </>
                ) : (
                  <span>Confirmer</span>
                )}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
