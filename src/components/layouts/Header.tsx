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
    getAuthUser().then(setUser).catch(console.error);
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
      <div className="container mx-auto px-4 h-16 flex items-center justify-between">
        <div className="flex items-center gap-6">
          <Link href="/" className="flex items-center gap-2">
            <span className="text-2xl font-bold">{t("title")}</span>
          </Link>
          <nav className="hidden md:flex gap-6">
            <Link href="/vehicles" className="text-sm font-medium hover:text-white/80 transition-colors">
              {t("findVehicle")}
            </Link>
            <Link href="/vehicles?availability=IMPORT" className="text-sm font-medium hover:text-white/80 transition-colors">
              {t("importCar")}
            </Link>
            <Link href="/articles" className="text-sm font-medium hover:text-white/80 transition-colors">
              {t("guides")}
            </Link>
          </nav>
        </div>
        
        <div className="flex items-center gap-4">
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
              <Link href={user.role === "ADMIN" ? "/admin" : "/dashboard"} className="hidden md:block text-sm font-medium hover:text-white/80 transition-colors">
                {user.role === "ADMIN" ? "Admin" : "Dashboard"}
              </Link>
              <form action={async () => {
                await logout();
                setUser(null);
                router.push("/");
              }}>
                <button type="submit" className="hidden md:block text-sm font-medium hover:text-white/80 transition-colors">
                  Sign Out
                </button>
              </form>
            </>
          ) : (
            <Link href="/signin" className="hidden md:block text-sm font-medium hover:text-white/80 transition-colors">
              {t("signIn")}
            </Link>
          )}

          <Link href="/dashboard/listings/create">
            <Button className="bg-white text-primary hover:bg-white/90">{t("sellCar")}</Button>
          </Link>
        </div>
      </div>
    </header>
  );
}
