"use client";

import { useState } from "react";
import { login, resendVerificationOtp } from "@/lib/actions";
import { useRouter } from "@/i18n/routing";
import Link from "next/link";
import { Loader2, AlertCircle, Mail, ArrowRight } from "lucide-react";

export default function SignInPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [unverifiedEmail, setUnverifiedEmail] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isSendingVerification, setIsSendingVerification] = useState(false);
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");
    setUnverifiedEmail(null);
    
    try {
      const res = await login(email, password);
      if (res.success) {
        if (res.role === "ADMIN" || res.role === "SUPER_ADMIN") {
          router.push("/admin");
        } else {
          router.push("/dashboard");
        }
      } else if (res.unverified) {
        setUnverifiedEmail(res.email || email);
        setError("Veuillez vérifier votre adresse email pour vous connecter.");
      } else {
        setError(res.error || "Identifiants invalides");
      }
    } catch (err: any) {
      setError("Erreur de connexion. Veuillez réessayer.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleVerifyNow = async () => {
    if (!unverifiedEmail) return;
    setIsSendingVerification(true);
    try {
      await resendVerificationOtp(unverifiedEmail);
    } catch (err) {
      console.error("Resend error:", err);
    } finally {
      setIsSendingVerification(false);
      router.push(`/verify-email?email=${encodeURIComponent(unverifiedEmail)}`);
    }
  };

  return (
    <div className="h-[calc(100dvh-3.5rem)] md:min-h-[calc(100vh-4rem)] -mb-16 lg:mb-0 flex items-center justify-center bg-zinc-50 dark:bg-zinc-950 px-4 py-2 overflow-hidden">
      <div className="w-full max-w-md bg-white dark:bg-zinc-900 rounded-2xl shadow-xl border border-zinc-200 dark:border-zinc-800 p-5 sm:p-8 my-auto">
        <h1 className="text-xl sm:text-2xl font-bold mb-1 text-center text-zinc-900 dark:text-zinc-100">Connexion</h1>
        <p className="text-xs text-zinc-500 dark:text-zinc-400 text-center mb-4 sm:mb-6">Accédez à votre espace Car Relais</p>
        
        {/* Unverified Email Alert Banner with 'Verify Now' Button */}
        {unverifiedEmail ? (
          <div className="p-3.5 mb-4 bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-900/40 rounded-xl space-y-2.5">
            <div className="flex items-start gap-2 text-amber-800 dark:text-amber-300">
              <Mail className="w-4 h-4 shrink-0 text-amber-600 mt-0.5" />
              <div>
                <p className="text-xs font-semibold">Compte non vérifié</p>
                <p className="text-[11px] text-amber-700 dark:text-amber-400 mt-0.5 leading-relaxed">
                  Veuillez confirmer votre adresse email ({unverifiedEmail}) pour activer votre compte.
                </p>
              </div>
            </div>
            <button
              type="button"
              onClick={handleVerifyNow}
              disabled={isSendingVerification}
              className="w-full h-9 bg-amber-600 hover:bg-amber-700 text-white font-semibold text-xs rounded-lg transition-colors flex items-center justify-center gap-2 cursor-pointer shadow-xs"
            >
              {isSendingVerification ? (
                <>
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  <span>Envoi du lien...</span>
                </>
              ) : (
                <>
                  <span>Vérifier maintenant</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </>
              )}
            </button>
          </div>
        ) : error ? (
          <div className="p-3 mb-4 bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-900/40 rounded-xl text-red-600 dark:text-red-400 text-xs font-medium flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
        ) : null}

        <form onSubmit={handleSubmit} className="space-y-3.5 sm:space-y-4">
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-zinc-600 dark:text-zinc-400 mb-1">Adresse email</label>
            <input 
              type="email" 
              value={email} 
              onChange={e => setEmail(e.target.value)} 
              required 
              placeholder="votre@email.com"
              className="w-full h-10 sm:h-11 px-3.5 border border-zinc-300 dark:border-zinc-700 rounded-xl text-sm dark:bg-zinc-800 focus:outline-none focus:ring-2 focus:ring-primary/20" 
            />
          </div>
          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="block text-xs font-semibold uppercase tracking-wider text-zinc-600 dark:text-zinc-400">Mot de passe</label>
              <Link href="/forgot-password" className="text-xs text-primary hover:underline font-medium">
                Mot de passe oublié ?
              </Link>
            </div>
            <input 
              type="password" 
              value={password} 
              onChange={e => setPassword(e.target.value)} 
              required 
              placeholder="••••••••"
              className="w-full h-10 sm:h-11 px-3.5 border border-zinc-300 dark:border-zinc-700 rounded-xl text-sm dark:bg-zinc-800 focus:outline-none focus:ring-2 focus:ring-primary/20" 
            />
          </div>
          <button 
            type="submit" 
            disabled={isLoading}
            className="w-full h-10 sm:h-11 bg-primary text-white font-semibold rounded-xl hover:bg-primary/90 transition-colors shadow-sm disabled:opacity-60 flex items-center justify-center gap-2 cursor-pointer mt-1 sm:mt-2"
          >
            {isLoading && <Loader2 className="w-4 h-4 animate-spin" />}
            <span>{isLoading ? "Connexion en cours..." : "Se connecter"}</span>
          </button>
        </form>

        <p className="mt-4 sm:mt-6 text-xs text-center text-zinc-500">
          Vous n'avez pas encore de compte ?{" "}
          <Link href="/signup" className="text-primary font-medium hover:underline">
            Créer un compte
          </Link>
        </p>
      </div>
    </div>
  );
}
