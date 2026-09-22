"use client";

import { useState } from "react";
import { useRouter } from "@/i18n/routing";
import { requestPasswordReset } from "@/lib/actions";
import { KeyRound, AlertCircle, Loader2, ArrowRight } from "lucide-react";
import Link from "next/link";

export default function ForgotPasswordPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) {
      setError("Veuillez renseigner votre adresse email.");
      return;
    }

    setIsLoading(true);
    setError("");

    try {
      const res = await requestPasswordReset(email.trim());
      if (res.success) {
        router.push(`/reset-password?email=${encodeURIComponent(email.trim())}`);
      } else {
        setError(res.error || "Une erreur est survenue lors de la demande.");
      }
    } catch (err: any) {
      setError("Erreur réseau ou serveur. Veuillez réessayer.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-zinc-50 dark:bg-zinc-950 p-4">
      <div className="w-full max-w-md bg-white dark:bg-zinc-900 rounded-2xl shadow-xl border border-zinc-200 dark:border-zinc-800 p-8">
        <div className="flex justify-center mb-6">
          <div className="w-16 h-16 bg-amber-50 dark:bg-amber-950/40 text-amber-600 dark:text-amber-400 rounded-2xl flex items-center justify-center border border-amber-100 dark:border-amber-900/40 shadow-xs">
            <KeyRound className="w-8 h-8" />
          </div>
        </div>

        <h1 className="text-2xl font-bold text-center text-zinc-900 dark:text-zinc-100 mb-2">
          Mot de passe oublié ?
        </h1>

        <p className="text-xs text-zinc-500 dark:text-zinc-400 text-center mb-6 leading-relaxed">
          Saisissez l'adresse email associée à votre compte Car Relais. Nous vous enverrons un code PIN de sécurité pour réinitialiser votre mot de passe.
        </p>

        {error && (
          <div className="p-3 mb-5 bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-900/40 rounded-xl text-red-600 dark:text-red-400 text-xs font-medium flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

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

          <button
            type="submit"
            disabled={isLoading || !email.trim()}
            className="w-full h-11 bg-primary text-white font-semibold rounded-xl hover:bg-primary/90 transition-colors shadow-sm disabled:opacity-50 flex items-center justify-center gap-2 cursor-pointer mt-2"
          >
            {isLoading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Envoi du code PIN...</span>
              </>
            ) : (
              <>
                <span>Recevoir mon code PIN</span>
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </form>

        <div className="mt-6 pt-6 border-t border-zinc-100 dark:border-zinc-800 text-center">
          <Link href="/signin" className="text-xs text-primary font-medium hover:underline">
            ← Revenir à la page de connexion
          </Link>
        </div>
      </div>
    </div>
  );
}
