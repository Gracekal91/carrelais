"use client";

import { useSearchParams } from "next/navigation";
import { useRouter } from "@/i18n/routing";
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/Button";
import { SlidersHorizontal, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { Select } from "@/components/ui/Select";

export function FilterPanel() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [isOpen, setIsOpen] = useState(false);
  
  // Local state for filters
  const [make, setMake] = useState(searchParams.get("make") || "");
  const [minPrice, setMinPrice] = useState(searchParams.get("minPrice") || "");
  const [maxPrice, setMaxPrice] = useState(searchParams.get("maxPrice") || "");
  const [availability, setAvailability] = useState(searchParams.get("availability") || "");
  const [transmission, setTransmission] = useState(searchParams.get("transmission") || "");
  const [fuelType, setFuelType] = useState(searchParams.get("fuelType") || "");

  // Update local state when searchParams change (e.g. from back/forward navigation)
  useEffect(() => {
    setMake(searchParams.get("make") || "");
    setMinPrice(searchParams.get("minPrice") || "");
    setMaxPrice(searchParams.get("maxPrice") || "");
    setAvailability(searchParams.get("availability") || "");
    setTransmission(searchParams.get("transmission") || "");
    setFuelType(searchParams.get("fuelType") || "");
  }, [searchParams]);

  const applyFilters = () => {
    const params = new URLSearchParams(searchParams.toString());
    
    if (make) params.set("make", make); else params.delete("make");
    if (minPrice) params.set("minPrice", minPrice); else params.delete("minPrice");
    if (maxPrice) params.set("maxPrice", maxPrice); else params.delete("maxPrice");
    if (availability) params.set("availability", availability); else params.delete("availability");
    if (transmission) params.set("transmission", transmission); else params.delete("transmission");
    if (fuelType) params.set("fuelType", fuelType); else params.delete("fuelType");
    
    // Reset to page 1 when filtering
    params.delete("page");
    
    router.push(`/vehicles?${params.toString()}`);
    setIsOpen(false);
  };

  const clearFilters = () => {
    router.push("/vehicles");
    setIsOpen(false);
  };

  const makeOptions = [
    { value: "", label: "All Makes" },
    { value: "Toyota", label: "Toyota" },
    { value: "Lexus", label: "Lexus" },
    { value: "Mercedes-Benz", label: "Mercedes-Benz" },
    { value: "BMW", label: "BMW" },
    { value: "Hyundai", label: "Hyundai" }
  ];

  const transmissionOptions = [
    { value: "", label: "Any" },
    { value: "Automatic", label: "Automatic" },
    { value: "Manual", label: "Manual" }
  ];

  const fuelTypeOptions = [
    { value: "", label: "Any" },
    { value: "Petrol", label: "Petrol" },
    { value: "Diesel", label: "Diesel" },
    { value: "Hybrid", label: "Hybrid" },
    { value: "Electric", label: "Electric" }
  ];

  const FilterContent = (
    <div className="space-y-6">
      <div>
        <h4 className="font-semibold mb-3">Availability</h4>
        <div className="space-y-2">
          <label className="flex items-center gap-2">
            <input type="radio" name="availability" checked={availability === ""} onChange={() => setAvailability("")} className="text-primary focus:ring-primary h-4 w-4" />
            <span>Any</span>
          </label>
          <label className="flex items-center gap-2">
            <input type="radio" name="availability" checked={availability === "IN_CONGO"} onChange={() => setAvailability("IN_CONGO")} className="text-primary focus:ring-primary h-4 w-4" />
            <span>Available in Congo</span>
          </label>
          <label className="flex items-center gap-2">
            <input type="radio" name="availability" checked={availability === "IMPORT"} onChange={() => setAvailability("IMPORT")} className="text-primary focus:ring-primary h-4 w-4" />
            <span>Available for Import</span>
          </label>
        </div>
      </div>

      <div>
        <h4 className="font-semibold mb-3">Make</h4>
        <Select value={make} onChange={setMake} options={makeOptions} placeholder="All Makes" />
      </div>

      <div>
        <h4 className="font-semibold mb-3">Price Range (USD)</h4>
        <div className="flex gap-2 items-center">
          <input type="number" placeholder="Min" value={minPrice} onChange={(e) => setMinPrice(e.target.value)} className="w-full h-10 border border-zinc-300 dark:border-zinc-700 rounded-md px-3 bg-white dark:bg-zinc-900 focus:ring-2 focus:ring-primary outline-none" />
          <span className="text-zinc-500">-</span>
          <input type="number" placeholder="Max" value={maxPrice} onChange={(e) => setMaxPrice(e.target.value)} className="w-full h-10 border border-zinc-300 dark:border-zinc-700 rounded-md px-3 bg-white dark:bg-zinc-900 focus:ring-2 focus:ring-primary outline-none" />
        </div>
      </div>

      <div>
        <h4 className="font-semibold mb-3">Transmission</h4>
        <Select value={transmission} onChange={setTransmission} options={transmissionOptions} placeholder="Any" />
      </div>
      
      <div>
        <h4 className="font-semibold mb-3">Fuel Type</h4>
        <Select value={fuelType} onChange={setFuelType} options={fuelTypeOptions} placeholder="Any" />
      </div>
      
      <div className="flex gap-2 pt-4">
        <Button variant="outline" className="flex-1" onClick={clearFilters}>Clear</Button>
        <Button className="flex-1" onClick={applyFilters}>Apply</Button>
      </div>
    </div>
  );

  return (
    <>
      {/* Mobile Toggle Button */}
      <div className="lg:hidden mb-4">
        <Button variant="outline" className="w-full flex items-center justify-center gap-2" onClick={() => setIsOpen(true)}>
          <SlidersHorizontal className="w-4 h-4" />
          Filters
        </Button>
      </div>

      {/* Desktop Sidebar */}
      <div className="hidden lg:block w-64 shrink-0 pr-6 border-r h-[calc(100vh-4rem)] sticky top-16 overflow-y-auto pb-8">
        <div className="pt-8">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-xl font-bold">Filters</h3>
          </div>
          {FilterContent}
        </div>
      </div>

      {/* Mobile Slide-over */}
      {isOpen && (
        <div className="fixed inset-0 z-[100] lg:hidden flex">
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm" onClick={() => setIsOpen(false)} />
          <div className="relative ml-auto h-full w-[85%] max-w-sm bg-background p-6 shadow-xl flex flex-col animate-in slide-in-from-right overflow-y-auto">
            <div className="flex items-center justify-between mb-8">
              <h3 className="text-xl font-bold">Filters</h3>
              <button onClick={() => setIsOpen(false)} className="p-2 rounded-full hover:bg-zinc-100 dark:hover:bg-zinc-800">
                <X className="w-5 h-5" />
              </button>
            </div>
            {FilterContent}
          </div>
        </div>
      )}
    </>
  );
}
