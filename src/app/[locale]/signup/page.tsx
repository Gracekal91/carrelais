"use client";

import { useState } from "react";
import { signup } from "@/lib/actions";
import { useRouter } from "@/i18n/routing";
import { Loader2 } from "lucide-react";
import Link from "next/link";

export default function SignUpPage() {
  const router = useRouter();
  const [accountType, setAccountType] = useState<"INDIVIDUAL" | "DEALERSHIP">("INDIVIDUAL");
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    password: "",
    dealershipName: "",
    location: "",
  });
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");

    try {
      const res = await signup({ ...formData, accountType });
      if (res.success && res.requireVerification) {
        // Route to OTP email verification screen
        router.push(`/verify-email?email=${encodeURIComponent(res.email || formData.email)}`);
      } else if (res.success) {
        router.push("/dashboard");
      } else {
        setError(res.error || "Une erreur est survenue lors de l'inscription.");
      }
    } catch (err: any) {
      setError("Erreur réseau ou serveur. Veuillez réessayer.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-zinc-50 dark:bg-zinc-950 p-4">
      <div className="w-full max-w-lg bg-white dark:bg-zinc-900 rounded-2xl shadow-xl border border-zinc-200 dark:border-zinc-800 p-8">
        <h1 className="text-2xl font-bold mb-2 text-center text-zinc-900 dark:text-zinc-100">Créer un compte</h1>
        <p className="text-xs text-zinc-500 dark:text-zinc-400 text-center mb-6">Rejoignez la première marketplace automobile en RDC</p>
        
        <div className="flex gap-3 mb-6 p-1 bg-zinc-100 dark:bg-zinc-800 rounded-xl">
          <button 
            type="button"
            className={`flex-1 py-2.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${accountType === "INDIVIDUAL" ? "bg-white dark:bg-zinc-900 text-primary shadow-xs" : "text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-200"}`}
            onClick={() => setAccountType("INDIVIDUAL")}
          >
            Particulier
          </button>
          <button 
            type="button"
            className={`flex-1 py-2.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${accountType === "DEALERSHIP" ? "bg-white dark:bg-zinc-900 text-primary shadow-xs" : "text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-200"}`}
            onClick={() => setAccountType("DEALERSHIP")}
          >
            Concessionnaire
          </button>
        </div>

        {error && (
          <div className="p-3 mb-5 bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-900/40 rounded-xl text-red-600 dark:text-red-400 text-xs font-medium">
            {error}
          </div>
        )}
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-zinc-600 dark:text-zinc-400 mb-1.5">Prénom</label>
              <input 
                type="text" 
                required 
                placeholder="Ex: Jean"
                className="w-full h-11 px-3.5 border border-zinc-300 dark:border-zinc-700 rounded-xl text-sm dark:bg-zinc-800 focus:outline-none focus:ring-2 focus:ring-primary/20" 
                value={formData.firstName} 
                onChange={e => setFormData({...formData, firstName: e.target.value})} 
              />
            </div>
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-zinc-600 dark:text-zinc-400 mb-1.5">Nom</label>
              <input 
                type="text" 
                required 
                placeholder="Ex: Mukendi"
                className="w-full h-11 px-3.5 border border-zinc-300 dark:border-zinc-700 rounded-xl text-sm dark:bg-zinc-800 focus:outline-none focus:ring-2 focus:ring-primary/20" 
                value={formData.lastName} 
                onChange={e => setFormData({...formData, lastName: e.target.value})} 
              />
            </div>
          </div>
          
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-zinc-600 dark:text-zinc-400 mb-1.5">Adresse email</label>
            <input 
              type="email" 
              required 
              placeholder="votre@email.com"
              className="w-full h-11 px-3.5 border border-zinc-300 dark:border-zinc-700 rounded-xl text-sm dark:bg-zinc-800 focus:outline-none focus:ring-2 focus:ring-primary/20" 
              value={formData.email} 
              onChange={e => setFormData({...formData, email: e.target.value})} 
            />
          </div>
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-zinc-600 dark:text-zinc-400 mb-1.5">Numéro de téléphone / WhatsApp</label>
            <input 
              type="tel" 
              required 
              placeholder="+243 000 000 000"
              className="w-full h-11 px-3.5 border border-zinc-300 dark:border-zinc-700 rounded-xl text-sm dark:bg-zinc-800 focus:outline-none focus:ring-2 focus:ring-primary/20" 
              value={formData.phone} 
              onChange={e => setFormData({...formData, phone: e.target.value})} 
            />
          </div>
          
          {accountType === "DEALERSHIP" && (
            <>
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-zinc-600 dark:text-zinc-400 mb-1.5">Nom de la concession</label>
                <input 
                  type="text" 
                  required 
                  placeholder="Ex: Auto Kinshasa Motors"
                  className="w-full h-11 px-3.5 border border-zinc-300 dark:border-zinc-700 rounded-xl text-sm dark:bg-zinc-800 focus:outline-none focus:ring-2 focus:ring-primary/20" 
                  value={formData.dealershipName} 
                  onChange={e => setFormData({...formData, dealershipName: e.target.value})} 
                />
              </div>
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-zinc-600 dark:text-zinc-400 mb-1.5">Adresse de la concession</label>
                <input 
                  type="text" 
                  required 
                  placeholder="Ex: Boulevard du 30 Juin, Gombe"
                  className="w-full h-11 px-3.5 border border-zinc-300 dark:border-zinc-700 rounded-xl text-sm dark:bg-zinc-800 focus:outline-none focus:ring-2 focus:ring-primary/20" 
                  value={formData.location} 
                  onChange={e => setFormData({...formData, location: e.target.value})} 
                />
              </div>
            </>
          )}

          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-zinc-600 dark:text-zinc-400 mb-1.5">Mot de passe</label>
            <input 
              type="password" 
              required 
              placeholder="••••••••"
              className="w-full h-11 px-3.5 border border-zinc-300 dark:border-zinc-700 rounded-xl text-sm dark:bg-zinc-800 focus:outline-none focus:ring-2 focus:ring-primary/20" 
              value={formData.password} 
              onChange={e => setFormData({...formData, password: e.target.value})} 
            />
          </div>
          
          <button 
            type="submit" 
            disabled={isLoading}
            className="w-full h-11 bg-primary text-white font-semibold rounded-xl hover:bg-primary/90 transition-colors shadow-sm disabled:opacity-60 flex items-center justify-center gap-2 cursor-pointer mt-2"
          >
            {isLoading && <Loader2 className="w-4 h-4 animate-spin" />}
            <span>{isLoading ? "Création du compte..." : "Créer mon compte"}</span>
          </button>
        </form>
        
        <p className="mt-6 text-xs text-center text-zinc-500">
          Vous avez déjà un compte ?{" "}
          <Link href="/signin" className="text-primary font-medium hover:underline">
            Se connecter
          </Link>
        </p>
      </div>
    </div>
  );
}
