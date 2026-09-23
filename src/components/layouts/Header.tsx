"use client";

import { Link, usePathname, useRouter } from "@/i18n/routing";
import { Button } from "../ui/Button";
import { ThemeToggle } from "../ThemeToggle";
import { useTranslations, useLocale } from "next-intl";
import { Select } from "../ui/Select";
import { useEffect, useState } from "react";
import { getAuthUser, logout } from "@/lib/actions";

export function Header() {
  const t = useTranslations("Header");
  const locale = useLocale();
  const router = useRouter();
  const pathname = usePathname();
  
  const [user, setUser] = useState<{id: string, role: string, name: string} | null>(null);

  useEffect(() => {
    getAuthUser().then(setUser).catch(() => setUser(null));
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
          <Link href="/" className="flex items-center gap-2">
            <span className="text-xl md:text-2xl font-black tracking-tight">{t("title")}</span>
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
    </header>
  );
}
