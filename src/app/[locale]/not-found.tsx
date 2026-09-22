import { Link } from "@/i18n/routing";
import { CarFront, Home, Search } from "lucide-react";

export default function NotFound() {
  return (
    <div className="flex-1 flex flex-col items-center justify-center min-h-[60vh] px-4 py-16 text-center">
      <div className="w-16 h-16 rounded-full bg-primary/10 text-primary flex items-center justify-center mb-6 shadow-sm">
        <CarFront className="w-8 h-8" />
      </div>

      <span className="text-xs font-bold uppercase tracking-widest text-primary mb-2">
        Erreur 404
      </span>

      <h1 className="text-3xl sm:text-4xl font-black text-zinc-900 dark:text-zinc-50 mb-3 tracking-tight">
        Page introuvable
      </h1>

      <p className="text-sm sm:text-base text-zinc-600 dark:text-zinc-400 max-w-md mx-auto mb-8 leading-relaxed">
        Le véhicule, l&apos;article ou la page que vous recherchez n&apos;existe pas ou a été déplacé.
      </p>

      <div className="flex flex-wrap items-center justify-center gap-3">
        <Link
          href="/vehicles"
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-primary text-white text-xs sm:text-sm font-bold hover:bg-primary/90 transition-colors shadow-sm cursor-pointer"
        >
          <Search className="w-4 h-4" />
          <span>Explorer les véhicules</span>
        </Link>
        <Link
          href="/"
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 text-zinc-700 dark:text-zinc-300 text-xs sm:text-sm font-semibold hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors cursor-pointer"
        >
          <Home className="w-4 h-4" />
          <span>Accueil</span>
        </Link>
      </div>
    </div>
  );
}
