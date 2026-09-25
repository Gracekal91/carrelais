"use client";

import { Link, usePathname, useRouter } from "@/i18n/routing";
import Image from "next/image";
import { Button } from "../ui/Button";
import { ThemeToggle } from "../ThemeToggle";
import { useTranslations, useLocale } from "next-intl";
import { Select } from "../ui/Select";
import { useEffect, useState } from "react";
import { getAuthUser, logout } from "@/lib/actions";
import { Menu, X, CarFront, Globe, BookOpen } from "lucide-react";

export function Header() {
  const t = useTranslations("Header");
  const locale = useLocale();
  const router = useRouter();
  const pathname = usePathname();
  
  const [user, setUser] = useState<{id: string, role: string, name: string} | null>(null);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    getAuthUser().then(setUser).catch(() => setUser(null));
    setMobileMenuOpen(false);
  }, [pathname]); // re-check on nav

  const handleLanguageChange = (value: string) => {
    router.replace(pathname, { locale: value });
  };

  const languageOptions = [
    { value: "fr", label: "FR" },
    { value: "en", label: "EN" }
  ];

  return (
    <header className="sticky top-0 z-50 w-full border-b border-primary-foreground/10 bg-primary text-white backdrop-blur supports-[backdrop-filter]:bg-primary/95">
      <div className="container mx-auto px-4 h-14 md:h-16 flex items-center justify-between">
        <div className="flex items-center gap-6">
          <Link href="/" aria-label="Car Relais" className="flex items-center group">
            <Image
              src="/logo_white.png"
              alt="Car Relais"
              width={75}
              height={42}
              priority
              className="h-8 sm:h-9 md:h-10 w-auto object-contain transition-transform group-hover:scale-105"
            />
          </Link>
          <nav className="hidden md:flex gap-6">
            <Link href="/vehicles" className="text-sm font-medium hover:text-white/80 transition-colors">
              {t("findVehicle")}
            </Link>
            <Link href="/vehicles?availability=IMPORT" className="text-sm font-medium hover:text-white/80 transition-colors">
              {t("importCar")}
            </Link>
            <Link 
              href={locale === "en" ? "/learn" : "/apprendre"} 
              className="text-sm font-medium hover:text-white/80 transition-colors"
            >
              {t("learn")}
            </Link>
          </nav>
        </div>
        
        <div className="flex items-center gap-2.5 md:gap-4">
          {/* Mobile One-Tap Language Switcher */}
          <button
            type="button"
            onClick={() => handleLanguageChange(locale === "fr" ? "en" : "fr")}
            aria-label={locale === "fr" ? "Passer le site en anglais" : "Switch to French site"}
            className="md:hidden px-2.5 py-1 rounded-lg bg-white/10 hover:bg-white/20 active:bg-white/30 text-white font-bold text-xs uppercase tracking-wider transition-colors cursor-pointer"
            title="Changer de langue"
          >
            {locale === "fr" ? "EN" : "FR"}
          </button>

          {/* Desktop Language Selector */}
          <div className="relative hidden md:block w-20">
            <Select
              value={locale}
              onChange={handleLanguageChange}
              options={languageOptions}
              className="bg-primary-foreground/10 text-white border-transparent hover:bg-primary-foreground/20 focus:ring-white/20 h-9"
            />
          </div>

          <ThemeToggle />

          {/* Mobile Menu Hamburger Button */}
          <button
            type="button"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            aria-label={mobileMenuOpen ? "Fermer le menu" : "Ouvrir le menu"}
            className="md:hidden p-2 rounded-lg bg-white/10 hover:bg-white/20 active:bg-white/30 text-white transition-colors cursor-pointer"
          >
            {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
          
          {user ? (
            <>
              {(user.role === "ADMIN" || user.role === "SUPER_ADMIN") ? (
                <Link href="/admin" className="hidden md:block text-sm font-semibold text-amber-300 hover:text-white transition-colors">
                  Administration
                </Link>
              ) : (
                <Link href="/dashboard" className="hidden md:block text-sm font-medium hover:text-white/80 transition-colors">
                  Dashboard
                </Link>
              )}
              <form action={async () => {
                await logout();
                setUser(null);
                router.push("/");
              }}>
                <button type="submit" className="hidden md:block text-sm font-medium hover:text-white/80 transition-colors cursor-pointer">
                  Sign Out
                </button>
              </form>
            </>
          ) : (
            <Link href="/signin" className="hidden md:block text-sm font-medium hover:text-white/80 transition-colors">
              {t("signIn")}
            </Link>
          )}

          {/* Sell Car Button (Desktop only; on mobile, it is the primary bottom nav center action) */}
          <Link
            href={(user?.role === "ADMIN" || user?.role === "SUPER_ADMIN") ? "/admin/dashboard/listings/create" : "/dashboard/listings/create"}
            className="hidden md:inline-flex"
          >
            <Button className="bg-white text-primary hover:bg-white/90">{t("sellCar")}</Button>
          </Link>
        </div>
      </div>

      {/* Mobile Menu Drawer */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t border-primary-foreground/10 bg-primary text-white px-4 py-4 space-y-2 shadow-2xl animate-in slide-in-from-top-2 duration-200">
          <Link
            href="/vehicles"
            onClick={() => setMobileMenuOpen(false)}
            className="flex items-center gap-3 px-3.5 py-2.5 rounded-xl hover:bg-white/10 text-white font-medium text-sm transition-colors"
          >
            <CarFront className="w-4 h-4 text-white/80" />
            <span>{t("findVehicle")}</span>
          </Link>
          <Link
            href="/vehicles?availability=IMPORT"
            onClick={() => setMobileMenuOpen(false)}
            className="flex items-center gap-3 px-3.5 py-2.5 rounded-xl hover:bg-white/10 text-white font-medium text-sm transition-colors"
          >
            <Globe className="w-4 h-4 text-white/80" />
            <span>{t("importCar")}</span>
          </Link>
          <Link
            href={locale === "en" ? "/learn" : "/apprendre"}
            onClick={() => setMobileMenuOpen(false)}
            className="flex items-center gap-3 px-3.5 py-2.5 rounded-xl bg-white/15 text-white font-bold text-sm transition-colors"
          >
            <BookOpen className="w-4 h-4 text-amber-300" />
            <span>{t("learn")}</span>
            <span className="ml-auto text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full bg-amber-400 text-zinc-950">
              Guides
            </span>
          </Link>
          <div className="pt-2 border-t border-white/10 flex items-center justify-between px-1">
            <Link
              href={(user?.role === "ADMIN" || user?.role === "SUPER_ADMIN") ? "/admin/dashboard/listings/create" : "/dashboard/listings/create"}
              onClick={() => setMobileMenuOpen(false)}
              className="text-xs font-semibold text-white/90 hover:text-white"
            >
              {t("sellCar")}
            </Link>
            {user ? (
              <Link
                href={(user?.role === "ADMIN" || user?.role === "SUPER_ADMIN") ? "/admin" : "/dashboard"}
                onClick={() => setMobileMenuOpen(false)}
                className="text-xs font-semibold text-amber-300 hover:text-white"
              >
                {user.role.includes("ADMIN") ? "Administration" : "Dashboard"}
              </Link>
            ) : (
              <Link
                href="/signin"
                onClick={() => setMobileMenuOpen(false)}
                className="text-xs font-semibold text-white/90 hover:text-white"
              >
                {t("signIn")}
              </Link>
            )}
          </div>
        </div>
      )}
    </header>
  );
}
