import { AdvancedSearchWidget } from "@/components/search/AdvancedSearchWidget";
import { VehicleGrid } from "@/components/vehicles/VehicleGrid";
import { getFeaturedVehicles, dummyVehicles } from "@/lib/data";
import { Button } from "@/components/ui/Button";
import { Link } from "@/i18n/routing";
import { ArrowRight, ShieldCheck, Globe2, Clock } from "lucide-react";
import { useTranslations } from "next-intl";

export default function Home() {
  const featuredVehicles = getFeaturedVehicles();
  const localVehicles = dummyVehicles.filter(v => v.availability === "IN_CONGO").slice(0, 4);
  const tHome = useTranslations("Home");
  const tFeatures = useTranslations("Features");
  const tHero = useTranslations("Hero");

  return (
    <div className="flex flex-col min-h-screen">
      {/* Hero Section */}
      <section className="relative h-auto md:h-[60vh] min-h-[550px] flex items-center">
        {/* Background car image */}
        <div
          className="absolute inset-0 bg-cover bg-center bg-no-repeat"
          style={{
            backgroundImage:
              "url('https://images.unsplash.com/photo-1492144534655-ae79c964c9d7?auto=format&fit=crop&w=1920&q=90')",
          }}
        />
        {/* Layered overlay: dark left-to-right gradient + subtle vignette */}
        <div className="absolute inset-0 bg-gradient-to-r from-zinc-950/95 via-zinc-900/80 to-zinc-950/30" />
        <div className="absolute inset-0 bg-gradient-to-t from-zinc-950/60 via-transparent to-transparent" />

        {/* Content — left-aligned within container */}
        <div className="relative z-10 container mx-auto px-4 flex flex-col items-start justify-center h-full py-24 md:py-10">
          <p className="text-primary font-semibold tracking-widest text-sm md:text-base uppercase mb-3">
            {tHero("marketplace")}
          </p>

          {/* Widget capped at ~70% max width, left-aligned */}
          <div className="w-full max-w-2xl mb-12">
            <AdvancedSearchWidget />
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-16 bg-white dark:bg-zinc-900 border-y border-zinc-200 dark:border-zinc-800">
        <div className="container mx-auto px-4 grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="flex flex-col items-center text-center">
            <div className="w-12 h-12 bg-primary/10 text-primary rounded-xl flex items-center justify-center mb-4">
              <Globe2 className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-semibold mb-2">{tFeatures("localImportTitle")}</h3>
            <p className="text-zinc-500">{tFeatures("localImportDesc")}</p>
          </div>
          <div className="flex flex-col items-center text-center">
            <div className="w-12 h-12 bg-primary/10 text-primary rounded-xl flex items-center justify-center mb-4">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-semibold mb-2">{tFeatures("verifiedSellersTitle")}</h3>
            <p className="text-zinc-500">{tFeatures("verifiedSellersDesc")}</p>
          </div>
          <div className="flex flex-col items-center text-center">
            <div className="w-12 h-12 bg-primary/10 text-primary rounded-xl flex items-center justify-center mb-4">
              <Clock className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-semibold mb-2">{tFeatures("fastSearchTitle")}</h3>
            <p className="text-zinc-500">{tFeatures("fastSearchDesc")}</p>
          </div>
        </div>
      </section>

      {/* Featured Vehicles */}
      <section className="py-20 border-b border-zinc-200 dark:border-zinc-800">
        <div className="container mx-auto px-4">
          <div className="flex justify-between items-end mb-8">
            <div>
              <h2 className="text-3xl font-bold mb-2">{tHome("featuredTitle")}</h2>
              <p className="text-zinc-500">{tHome("featuredDesc")}</p>
            </div>
            <Link href="/vehicles">
              <Button variant="ghost" className="hidden sm:flex gap-2">
                {tHome("viewAll")} <ArrowRight className="w-4 h-4" />
              </Button>
            </Link>
          </div>
          <VehicleGrid vehicles={featuredVehicles.slice(0, 4)} />
          <div className="mt-8 sm:hidden">
            <Link href="/vehicles" className="w-full">
              <Button variant="outline" className="w-full">{tHome("viewAllVehicles")}</Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Local Vehicles */}
      <section className="py-20 bg-zinc-50 dark:bg-zinc-950/50">
        <div className="container mx-auto px-4">
          <div className="flex justify-between items-end mb-8">
            <div>
              <h2 className="text-3xl font-bold mb-2">{tHome("availableCongoTitle")}</h2>
              <p className="text-zinc-500">{tHome("availableCongoDesc")}</p>
            </div>
            <Link href="/vehicles?availability=IN_CONGO">
              <Button variant="ghost" className="hidden sm:flex gap-2">
                {tHome("viewLocalInventory")} <ArrowRight className="w-4 h-4" />
              </Button>
            </Link>
          </div>
          <VehicleGrid vehicles={localVehicles} />
        </div>
      </section>
    </div>
  );
}

