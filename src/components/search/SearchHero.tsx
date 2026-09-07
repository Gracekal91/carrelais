"use client";

import { useState } from "react";
import { useRouter } from "@/i18n/routing";
import { Button } from "@/components/ui/Button";
import { Search, ChevronDown } from "lucide-react";
import { useTranslations } from "next-intl";

import { Select } from "@/components/ui/Select";

export function SearchHero() {
  const router = useRouter();
  const t = useTranslations("SearchHero");
  const [make, setMake] = useState("");
  const [model, setModel] = useState("");

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    const params = new URLSearchParams();
    if (make) params.set("make", make);
    if (model) params.set("model", model);
    
    router.push(`/vehicles?${params.toString()}`);
  };

  const makeOptions = [
    { value: "", label: t("allMakes") },
    { value: "Toyota", label: "Toyota" },
    { value: "Lexus", label: "Lexus" },
    { value: "Mercedes-Benz", label: "Mercedes-Benz" },
    { value: "BMW", label: "BMW" },
    { value: "Hyundai", label: "Hyundai" }
  ];

  return (
    <div className="bg-zinc-900 text-white rounded-2xl p-6 md:p-10 w-full max-w-5xl mx-auto shadow-2xl relative">
      {/* Decorative gradient background layer */}
      <div className="absolute inset-0 overflow-hidden rounded-2xl pointer-events-none">
        <div className="absolute top-0 right-0 w-64 h-64 bg-primary/20 rounded-full blur-3xl -translate-y-1/2 translate-x-1/3"></div>
        <div className="absolute bottom-0 left-0 w-64 h-64 bg-blue-500/20 rounded-full blur-3xl translate-y-1/2 -translate-x-1/3"></div>
      </div>
      
      <div className="relative z-10">
        <h1 className="text-3xl md:text-5xl font-bold mb-4 text-white">{t("title")}</h1>
        <p className="text-zinc-400 mb-8 max-w-xl text-lg">
          {t("subtitle")}
        </p>
        
        <form onSubmit={handleSearch} className="flex flex-col md:flex-row gap-4 bg-white/10 p-3 rounded-xl backdrop-blur-md border border-white/10">
          <div className="flex-1 relative z-50">
            <label htmlFor="make" className="sr-only">Make</label>
            <Select
              id="make"
              value={make}
              onChange={setMake}
              options={makeOptions}
              placeholder={t("allMakes")}
              className="h-12 bg-zinc-800/50 text-white border-zinc-700 hover:bg-zinc-800 focus:bg-zinc-800"
            />
          </div>
          
          <div className="flex-1">
            <label htmlFor="model" className="sr-only">Model</label>
            <input 
              type="text" 
              id="model"
              placeholder={t("modelPlaceholder")} 
              value={model}
              onChange={(e) => setModel(e.target.value)}
              className="w-full h-12 bg-zinc-800/50 text-white border-zinc-700 rounded-lg px-4 focus:ring-primary focus:border-primary placeholder:text-zinc-500 outline-none"
            />
          </div>
          
          <Button type="submit" size="lg" className="h-12 px-8 font-bold gap-2 whitespace-nowrap bg-primary text-white hover:bg-primary/90">
            <Search className="w-5 h-5" />
            {t("searchButton")}
          </Button>
        </form>
      </div>
    </div>
  );
}

