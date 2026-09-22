import { Link } from "@/i18n/routing";
import { useTranslations, useLocale } from "next-intl";

export function Footer() {
  const t = useTranslations("Footer");
  const locale = useLocale();
  const learnHref = locale === "en" ? "/learn" : "/apprendre";

  return (
    <footer className="border-t border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-950 py-12 pb-24 lg:pb-12">
      <div className="container mx-auto px-4 grid grid-cols-1 md:grid-cols-4 gap-8">
        <div>
          <span className="text-2xl font-bold text-primary block mb-4">CarRelais</span>
          <p className="text-sm text-zinc-600 dark:text-zinc-400">
            {t("desc")}
          </p>
        </div>
        
        <div>
          <h4 className="font-semibold mb-4">{t("buy")}</h4>
          <ul className="space-y-2 text-sm text-zinc-600 dark:text-zinc-400">
            <li><Link href="/vehicles">{t("allVehicles")}</Link></li>
            <li><Link href="/vehicles?availability=IN_CONGO">{t("localVehicles")}</Link></li>
            <li><Link href="/vehicles?availability=IMPORT">{t("importVehicles")}</Link></li>
            <li><Link href="/dealers">{t("dealerships")}</Link></li>
          </ul>
        </div>
        
        <div>
          <h4 className="font-semibold mb-4">{t("sell")}</h4>
          <ul className="space-y-2 text-sm text-zinc-600 dark:text-zinc-400">
            <li><Link href="/sell">{t("sell")}</Link></li>
            <li><Link href="/login?type=dealer">{t("dealerLogin")}</Link></li>
            <li><Link href="/pricing">{t("pricing")}</Link></li>
          </ul>
        </div>
        
        <div>
          <h4 className="font-semibold mb-4">{t("about")}</h4>
          <ul className="space-y-2 text-sm text-zinc-600 dark:text-zinc-400">
            <li><Link href="/about">{t("aboutUs")}</Link></li>
            <li><Link href="/contact">{t("contact")}</Link></li>
            <li><Link href={learnHref}>{t("learn")}</Link></li>
          </ul>
        </div>
      </div>
      
      <div className="container mx-auto px-4 mt-12 pt-8 border-t border-zinc-200 dark:border-zinc-800 text-center text-sm text-zinc-500">
        &copy; {new Date().getFullYear()} CarRelais. {t("rights")}
      </div>
    </footer>
  );
}
