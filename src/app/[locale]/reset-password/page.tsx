"use client";

import { useState, useEffect, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { useRouter } from "@/i18n/routing";
import { resetPasswordWithOtp, requestPasswordReset } from "@/lib/actions";
import { Lock, CheckCircle2, AlertCircle, Loader2, ArrowRight, Eye, EyeOff } from "lucide-react";
import Link from "next/link";

function ResetPasswordContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const emailParam = searchParams.get("email") || "";
  const pinParam = searchParams.get("pin") || "";

  const [email, setEmail] = useState(emailParam);
  const [pin, setPin] = useState(pinParam);
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isResending, setIsResending] = useState(false);
  const [resendMessage, setResendMessage] = useState("");

  useEffect(() => {
    if (emailParam) setEmail(emailParam);
    if (pinParam) setPin(pinParam);
  }, [emailParam, pinParam]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setResendMessage("");

    if (!email.trim() || !pin.trim() || !newPassword) {
      setError("Tous les champs sont requis.");
      return;
    }

    if (newPassword.length < 6) {
      setError("Le mot de passe doit comporter au moins 6 caractères.");
      return;
    }

    if (newPassword !== confirmPassword) {
      setError("Les deux mots de passe ne correspondent pas.");
      return;
    }

    setIsLoading(true);

    try {
      const res = await resetPasswordWithOtp(email.trim(), pin.trim(), newPassword);
      if (res.success) {
        setSuccess(true);
        setTimeout(() => {
          router.push("/signin");
        }, 1800);
      } else {
        setError(res.error || "Échec de la réinitialisation.");
      }
    } catch (err: any) {
      setError("Une erreur est survenue. Veuillez réessayer.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleResendPin = async () => {
    if (!email.trim()) {
      setError("Veuillez renseigner votre adresse email pour renvoyer le code.");
      return;
    }
    setIsResending(true);
    setError("");
    try {
      const res = await requestPasswordReset(email.trim());
      if (res.success) {
        setResendMessage("Un nouveau code PIN vous a été envoyé !");
      } else {
        setError(res.error || "Erreur lors du renvoi du code.");
      }
    } catch {
      setError("Impossible de renvoyer le code pour le moment.");
    } finally {
      setIsResending(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-zinc-50 dark:bg-zinc-950 p-4">
      <div className="w-full max-w-md bg-white dark:bg-zinc-900 rounded-2xl shadow-xl border border-zinc-200 dark:border-zinc-800 p-8">
        <div className="flex justify-center mb-6">
          <div className="w-16 h-16 bg-primary/10 text-primary rounded-2xl flex items-center justify-center border border-primary/20 shadow-xs">
            {success ? (
              <CheckCircle2 className="w-8 h-8 text-emerald-600 animate-bounce" />
            ) : (
              <Lock className="w-8 h-8" />
            )}
          </div>
        </div>

        <h1 className="text-2xl font-bold text-center text-zinc-900 dark:text-zinc-100 mb-2">
          {success ? "Mot de passe modifié !" : "Nouveau mot de passe"}
        </h1>

        <p className="text-xs text-zinc-500 dark:text-zinc-400 text-center mb-6 leading-relaxed">
          {success
            ? "Votre mot de passe a été mis à jour avec succès. Redirection vers la page de connexion..."
            : "Saisissez le code PIN à 6 chiffres reçu par email et définissez votre nouveau mot de passe."}
        </p>

        {error && (
          <div className="p-3 mb-5 bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-900/40 rounded-xl text-red-600 dark:text-red-400 text-xs font-medium flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {resendMessage && (
          <div className="p-3 mb-5 bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-900/40 rounded-xl text-emerald-700 dark:text-emerald-300 text-xs font-medium flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-600" />
            <span>{resendMessage}</span>
          </div>
        )}

        {!success && (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-zinc-600 dark:text-zinc-400 mb-1.5">
                Adresse email
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                placeholder="votre@email.com"
                className="w-full h-11 px-3.5 border border-zinc-300 dark:border-zinc-700 rounded-xl text-sm dark:bg-zinc-800 focus:outline-none focus:ring-2 focus:ring-primary/20"
              />
            </div>

            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="block text-xs font-semibold uppercase tracking-wider text-zinc-600 dark:text-zinc-400">
                  Code PIN (6 chiffres)
                </label>
                <button
                  type="button"
                  onClick={handleResendPin}
                  disabled={isResending}
                  className="text-[11px] text-primary hover:underline font-medium disabled:opacity-50"
                >
                  {isResending ? "Envoi..." : "Renvoyer le code"}
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
                className="w-full h-12 text-center tracking-[8px] text-xl font-bold font-mono border border-zinc-300 dark:border-zinc-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20 dark:bg-zinc-800"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-zinc-600 dark:text-zinc-400 mb-1.5">
                Nouveau mot de passe
              </label>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  required
                  placeholder="••••••••"
                  className="w-full h-11 px-3.5 pr-10 border border-zinc-300 dark:border-zinc-700 rounded-xl text-sm dark:bg-zinc-800 focus:outline-none focus:ring-2 focus:ring-primary/20"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-zinc-600"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-zinc-600 dark:text-zinc-400 mb-1.5">
                Confirmer le nouveau mot de passe
              </label>
              <input
                type={showPassword ? "text" : "password"}
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
                placeholder="••••••••"
                className="w-full h-11 px-3.5 border border-zinc-300 dark:border-zinc-700 rounded-xl text-sm dark:bg-zinc-800 focus:outline-none focus:ring-2 focus:ring-primary/20"
              />
            </div>

            <button
              type="submit"
              disabled={isLoading || pin.length < 6 || !newPassword}
              className="w-full h-11 bg-primary text-white font-semibold rounded-xl hover:bg-primary/90 transition-colors shadow-sm disabled:opacity-50 flex items-center justify-center gap-2 cursor-pointer mt-2"
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Mise à jour du mot de passe...</span>
                </>
              ) : (
                <>
                  <span>Enregistrer le mot de passe</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>
        )}

        <div className="mt-6 pt-6 border-t border-zinc-100 dark:border-zinc-800 text-center">
          <Link href="/signin" className="text-xs text-primary font-medium hover:underline">
            ← Revenir à la page de connexion
          </Link>
        </div>
      </div>
    </div>
  );
}

export default function ResetPasswordPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center bg-zinc-50 dark:bg-zinc-950">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
        </div>
      }
    >
      <ResetPasswordContent />
    </Suspense>
  );
}
