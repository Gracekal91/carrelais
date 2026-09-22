"use client";

import { useState, useEffect, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { useRouter } from "@/i18n/routing";
import { verifyEmailOtp, resendVerificationOtp } from "@/lib/actions";
import { Mail, CheckCircle2, AlertCircle, Loader2, ArrowRight, RefreshCw } from "lucide-react";
import Link from "next/link";

function VerifyEmailContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const emailParam = searchParams.get("email") || "";
  const codeParam = searchParams.get("code") || "";

  const [email, setEmail] = useState(emailParam);
  const [otp, setOtp] = useState(codeParam);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isResending, setIsResending] = useState(false);
  const [resendTimer, setResendTimer] = useState(60);
  const [canResend, setCanResend] = useState(false);
  const [infoMessage, setInfoMessage] = useState("");

  // Update email if query param changes
  useEffect(() => {
    if (emailParam) setEmail(emailParam);
    if (codeParam) setOtp(codeParam);
  }, [emailParam, codeParam]);

  // Resend countdown timer
  useEffect(() => {
    let interval: any = null;
    if (resendTimer > 0) {
      interval = setInterval(() => {
        setResendTimer((prev) => prev - 1);
      }, 1000);
    } else {
      setCanResend(true);
    }
    return () => clearInterval(interval);
  }, [resendTimer]);

  const handleVerify = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!email.trim() || !otp.trim()) {
      setError("Veuillez renseigner votre email et le code de vérification à 6 chiffres.");
      return;
    }

    setIsLoading(true);
    setError("");
    setInfoMessage("");

    try {
      const res = await verifyEmailOtp(email.trim(), otp.trim());
      if (res.success) {
        setSuccess(true);
        setTimeout(() => {
          if (res.role === "ADMIN" || res.role === "SUPER_ADMIN") {
            router.push("/admin");
          } else {
            router.push("/dashboard");
          }
        }, 1200);
      } else {
        setError(res.error || "Code de vérification invalide.");
      }
    } catch (err: any) {
      setError("Une erreur est survenue. Veuillez réessayer.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleResend = async () => {
    if (!canResend || !email.trim()) return;
    setIsResending(true);
    setError("");
    setInfoMessage("");

    try {
      const res = await resendVerificationOtp(email.trim());
      if (res.success) {
        setInfoMessage("Un nouveau code de vérification vous a été envoyé !");
        setResendTimer(60);
        setCanResend(false);
      } else {
        setError(res.error || "Erreur lors du renvoi du code.");
      }
    } catch (err: any) {
      setError("Impossible de renvoyer le code pour le moment.");
    } finally {
      setIsResending(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-zinc-50 dark:bg-zinc-950 p-4">
      <div className="w-full max-w-md bg-white dark:bg-zinc-900 rounded-2xl shadow-xl border border-zinc-200 dark:border-zinc-800 p-8">
        {/* Header Icon */}
        <div className="flex justify-center mb-6">
          <div className="w-16 h-16 bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 rounded-2xl flex items-center justify-center border border-emerald-100 dark:border-emerald-900/40 shadow-xs">
            {success ? (
              <CheckCircle2 className="w-8 h-8 animate-bounce text-emerald-600" />
            ) : (
              <Mail className="w-8 h-8" />
            )}
          </div>
        </div>

        <h1 className="text-2xl font-bold text-center text-zinc-900 dark:text-zinc-100 mb-2">
          {success ? "Compte vérifié !" : "Vérifiez votre adresse email"}
        </h1>

        <p className="text-sm text-zinc-500 dark:text-zinc-400 text-center mb-6 leading-relaxed">
          {success ? (
            "Votre compte est désormais activé. Redirection en cours..."
          ) : (
            <>
              Nous avons envoyé un code de confirmation à 6 chiffres à{" "}
              <strong className="text-zinc-800 dark:text-zinc-200">{email || "votre adresse email"}</strong>.
            </>
          )}
        </p>

        {error && (
          <div className="p-3 mb-5 bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-900/40 rounded-xl text-red-600 dark:text-red-400 text-xs font-medium flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {infoMessage && (
          <div className="p-3 mb-5 bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-900/40 rounded-xl text-emerald-700 dark:text-emerald-300 text-xs font-medium flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-600" />
            <span>{infoMessage}</span>
          </div>
        )}

        {!success && (
          <form onSubmit={handleVerify} className="space-y-4">
            {!emailParam && (
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
            )}

            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-zinc-600 dark:text-zinc-400 mb-1.5 text-center">
                Code de vérification (OTP)
              </label>
              <input
                type="text"
                inputMode="numeric"
                maxLength={6}
                value={otp}
                onChange={(e) => setOtp(e.target.value.replace(/[^0-9]/g, "").slice(0, 6))}
                required
                placeholder="123456"
                className="w-full h-14 text-center tracking-[10px] text-2xl font-bold font-mono border-2 border-zinc-200 dark:border-zinc-700 rounded-xl focus:border-primary focus:outline-none dark:bg-zinc-800"
              />
              <p className="text-[11px] text-zinc-400 text-center mt-1.5">
                Entrez le code à 6 chiffres reçu par email.
              </p>
            </div>

            <button
              type="submit"
              disabled={isLoading || otp.length < 6}
              className="w-full h-11 bg-primary text-white font-semibold rounded-xl hover:bg-primary/90 transition-colors shadow-sm disabled:opacity-50 flex items-center justify-center gap-2 cursor-pointer mt-2"
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Validation en cours...</span>
                </>
              ) : (
                <>
                  <span>Vérifier mon compte</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>
        )}

        {/* Resend Section */}
        {!success && (
          <div className="mt-6 pt-6 border-t border-zinc-100 dark:border-zinc-800 text-center">
            <p className="text-xs text-zinc-500 dark:text-zinc-400 mb-2">
              Vous n'avez pas reçu l'email ? (Vérifiez également vos courriers indésirables / spams)
            </p>
            <button
              type="button"
              disabled={!canResend || isResending}
              onClick={handleResend}
              className="text-xs font-semibold text-primary hover:underline disabled:text-zinc-400 disabled:no-underline inline-flex items-center gap-1.5 cursor-pointer"
            >
              {isResending ? (
                <>
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  <span>Envoi du code...</span>
                </>
              ) : canResend ? (
                <>
                  <RefreshCw className="w-3.5 h-3.5" />
                  <span>Renvoyer le code</span>
                </>
              ) : (
                <span>Renvoyer le code dans {resendTimer}s</span>
              )}
            </button>
          </div>
        )}

        <div className="mt-6 text-center">
          <Link href="/signin" className="text-xs text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200">
            Retour à la page de connexion
          </Link>
        </div>
      </div>
    </div>
  );
}

export default function VerifyEmailPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center bg-zinc-50 dark:bg-zinc-950">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
        </div>
      }
    >
      <VerifyEmailContent />
    </Suspense>
  );
}
