import Link from "next/link";
import { CarFront, Home, Search } from "lucide-react";

export default function GlobalNotFound() {
  return (
    <html lang="fr">
      <body className="min-h-screen bg-zinc-50 dark:bg-zinc-950 flex flex-col items-center justify-center p-6 text-zinc-900 dark:text-zinc-100 font-sans">
        <div className="w-16 h-16 rounded-full bg-red-600/10 text-red-600 flex items-center justify-center mb-6 shadow-sm">
          <CarFront className="w-8 h-8" />
        </div>
        <span className="text-xs font-bold uppercase tracking-widest text-red-600 mb-2">
          Erreur 404
        </span>
        <h1 className="text-3xl sm:text-4xl font-black mb-3 tracking-tight">
          Page introuvable
        </h1>
        <p className="text-sm sm:text-base text-zinc-600 dark:text-zinc-400 max-w-md mx-auto mb-8 text-center leading-relaxed">
          La page que vous recherchez n&apos;existe pas ou a été déplacée.
        </p>
        <div className="flex flex-wrap items-center justify-center gap-3">
          <Link
            href="/vehicles"
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-red-600 text-white text-xs sm:text-sm font-bold hover:bg-red-700 transition-colors shadow-sm"
          >
            <Search className="w-4 h-4" />
            <span>Explorer les véhicules</span>
          </Link>
          <Link
            href="/"
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 text-zinc-700 dark:text-zinc-300 text-xs sm:text-sm font-semibold hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"
          >
            <Home className="w-4 h-4" />
            <span>Accueil</span>
          </Link>
        </div>
      </body>
    </html>
  );
}
