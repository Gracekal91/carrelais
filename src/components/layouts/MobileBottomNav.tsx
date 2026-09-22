"use client";

import { Link, usePathname } from "@/i18n/routing";
import { Home, CarFront, PlusCircle, User, ShieldCheck } from "lucide-react";
import { useTranslations } from "next-intl";
import { useEffect, useState } from "react";
import { getAuthUser } from "@/lib/actions";
import { cn } from "@/lib/utils";

export function MobileBottomNav() {
  const t = useTranslations("MobileNav");
  const pathname = usePathname();
  const [user, setUser] = useState<{ id: string; role: string; name: string } | null>(null);

  useEffect(() => {
    getAuthUser().then(setUser).catch(() => setUser(null));
  }, [pathname]);

  // Hide on admin portal and auth screens
  if (
    pathname.startsWith("/admin") ||
    pathname.startsWith("/signin") ||
    pathname.startsWith("/login") ||
    pathname.startsWith("/signup") ||
    pathname.startsWith("/forgot-password") ||
    pathname.startsWith("/reset-password") ||
    pathname.startsWith("/verify-email")
  ) {
    return null;
  }

  const isHomeActive = pathname === "/" || pathname === "";
  const isVehiclesActive = pathname.startsWith("/vehicles");
  const isSellActive = pathname.startsWith("/dashboard/listings/create") || pathname.startsWith("/admin/dashboard/listings/create");
  const isAccountActive =
    pathname.startsWith("/dashboard") ||
    pathname.startsWith("/signin") ||
    pathname.startsWith("/signup");

  const isAdmin = user?.role === "ADMIN" || user?.role === "SUPER_ADMIN";
  const accountHref = user ? (isAdmin ? "/admin" : "/dashboard") : "/signin";
  const accountLabel = user ? (isAdmin ? t("admin") : t("account")) : t("signIn");
  const sellHref = isAdmin ? "/admin/dashboard/listings/create" : "/dashboard/listings/create";

  return (
    <nav 
      aria-label="Navigation mobile"
      className="fixed bottom-0 left-0 right-0 z-50 lg:hidden bg-white/95 dark:bg-zinc-950/95 backdrop-blur-lg border-t border-zinc-200 dark:border-zinc-800 shadow-[0_-4px_20px_rgba(0,0,0,0.06)] pb-[max(env(safe-area-inset-bottom),0.5rem)]"
    >
      <div className="grid grid-cols-4 items-center h-15 max-w-md mx-auto px-2">
        {/* 1. Accueil */}
        <Link
          href="/"
          className={cn(
            "flex flex-col items-center justify-center gap-0.5 h-full transition-colors relative py-1",
            isHomeActive
              ? "text-primary font-bold"
              : "text-zinc-500 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-200 font-medium"
          )}
        >
          <Home className={cn("w-5 h-5 transition-transform", isHomeActive && "scale-110 stroke-[2.5]")} />
          <span className="text-[11px] leading-tight tracking-tight">{t("home")}</span>
          {isHomeActive && (
            <span className="absolute bottom-0.5 w-1 h-1 rounded-full bg-primary" />
          )}
        </Link>

        {/* 2. Véhicules */}
        <Link
          href="/vehicles"
          className={cn(
            "flex flex-col items-center justify-center gap-0.5 h-full transition-colors relative py-1",
            isVehiclesActive
              ? "text-primary font-bold"
              : "text-zinc-500 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-200 font-medium"
          )}
        >
          <CarFront className={cn("w-5 h-5 transition-transform", isVehiclesActive && "scale-110 stroke-[2.5]")} />
          <span className="text-[11px] leading-tight tracking-tight">{t("vehicles")}</span>
          {isVehiclesActive && (
            <span className="absolute bottom-0.5 w-1 h-1 rounded-full bg-primary" />
          )}
        </Link>

        {/* 3. Vendre */}
        <Link
          href={sellHref}
          className={cn(
            "flex flex-col items-center justify-center gap-0.5 h-full transition-colors relative py-1",
            isSellActive
              ? "text-primary font-bold"
              : "text-zinc-500 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-200 font-medium"
          )}
        >
          <PlusCircle className={cn("w-5 h-5 transition-transform", isSellActive && "scale-110 stroke-[2.5]")} />
          <span className="text-[11px] leading-tight tracking-tight">{t("sell")}</span>
          {isSellActive && (
            <span className="absolute bottom-0.5 w-1 h-1 rounded-full bg-primary" />
          )}
        </Link>

        {/* 4. Profil / Compte */}
        <Link
          href={accountHref}
          className={cn(
            "flex flex-col items-center justify-center gap-0.5 h-full transition-colors relative py-1",
            isAccountActive
              ? "text-primary font-bold"
              : "text-zinc-500 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-200 font-medium"
          )}
        >
          {isAdmin ? (
            <ShieldCheck className={cn("w-5 h-5 transition-transform", isAccountActive && "scale-110 stroke-[2.5]")} />
          ) : (
            <User className={cn("w-5 h-5 transition-transform", isAccountActive && "scale-110 stroke-[2.5]")} />
          )}
          <span className="text-[11px] leading-tight tracking-tight truncate max-w-[64px]">{accountLabel}</span>
          {isAccountActive && (
            <span className="absolute bottom-0.5 w-1 h-1 rounded-full bg-primary" />
          )}
        </Link>
      </div>
    </nav>
  );
}
