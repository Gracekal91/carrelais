"use client";

import { useState } from "react";
import { useRouter } from "@/i18n/routing";
import { createListing } from "@/lib/actions";
import { Check, ChevronLeft, ChevronRight, Upload } from "lucide-react";
import { ExtendedVehicleListing } from "@/lib/db/schema";
import { Select } from "@/components/ui/Select";
import { useTranslations } from "next-intl";
import { MAKES_AND_MODELS } from "@/lib/search-constants";

const FEATURES_LIST = [
  "Air Conditioning", "Leather Seats", "Bluetooth", "Reverse Camera", 
  "Parking Sensors", "Cruise Control", "Navigation", "Electric Windows", "Central Locking"
];

export default function PostCarPage({ params }: { params: any }) {
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState<Partial<ExtendedVehicleListing>>({
    make: "",
    model: "",
    year: new Date().getFullYear(),
    bodyType: "SUV",
    condition: "Used",
    mileage: 0,
    transmission: "Automatic",
    fuelType: "Petrol",
    price: 0,
    isNegotiable: true,
    financeAvailable: false,
    color: "",
    doors: 4,
    seats: 5,
    features: [],
    images: ["https://images.unsplash.com/photo-1542362567-b07e54358753?auto=format&fit=crop&w=800&q=80"],
    description: "",
    availability: "IN_CONGO",
  });

  const update = (key: keyof ExtendedVehicleListing, value: any) => {
    setFormData(prev => ({ ...prev, [key]: value }));
  };

  const handleFeatureToggle = (feat: string) => {
    setFormData(prev => {
      const feats = prev.features || [];
      if (feats.includes(feat)) return { ...prev, features: feats.filter(f => f !== feat) };
      return { ...prev, features: [...feats, feat] };
    });
  };

  const handleSubmit = async () => {
    setIsSubmitting(true);
    const res = await createListing(formData);
    if (res.success) {
      router.push("/dashboard/listings");
    }
    setIsSubmitting(false);
  };

  const nextStep = (e: React.FormEvent) => {
    e.preventDefault();
    if (step < 7) setStep(step + 1);
    else handleSubmit();
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6 pb-20">
      <div className="flex items-center gap-4 mb-8">
        <h1 className="text-2xl font-bold">Post a Car</h1>
        <div className="flex-1 bg-zinc-200 dark:bg-zinc-800 h-2 rounded-full overflow-hidden ml-4">
          <div className="h-full bg-primary transition-all" style={{ width: `${(step / 7) * 100}%` }} />
        </div>
        <span className="text-sm font-medium text-zinc-500">Step {step} of 7</span>
      </div>

      <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl p-6 md:p-8 shadow-sm">
        <form onSubmit={nextStep}>
          
          {step === 1 && (
            <div className="space-y-6 animate-in fade-in slide-in-from-right-4">
              <h2 className="text-xl font-bold mb-4">Vehicle Basics</h2>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1">Make</label>
                  <Select 
                    value={formData.make || ""} 
                    onChange={val => {
                      update("make", val);
                      update("model", ""); // reset model when make changes
                    }} 
                    placeholder="Select a Make"
                    options={MAKES_AND_MODELS.map(m => ({ value: m.make, label: m.make }))}
                    className="h-[50px] border-zinc-200 dark:border-zinc-700 dark:bg-zinc-800"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Model</label>
                  <Select 
                    value={formData.model || ""} 
                    onChange={val => update("model", val)} 
                    placeholder="Select a Model"
                    options={
                      formData.make 
                        ? MAKES_AND_MODELS.find(m => m.make === formData.make)?.models.map(mod => ({ value: mod.name, label: mod.name })) || []
                        : []
                    }
                    disabled={!formData.make}
                    className="h-[50px] border-zinc-200 dark:border-zinc-700 dark:bg-zinc-800 disabled:opacity-50"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Year</label>
                  <input required type="number" min="1990" max={new Date().getFullYear() + 1} value={formData.year} onChange={e => update("year", parseInt(e.target.value))} className="w-full h-[50px] px-3 border border-zinc-200 rounded-lg dark:bg-zinc-800 dark:border-zinc-700" />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Condition</label>
                  <Select 
                    value={formData.condition || "Used"} 
                    onChange={val => update("condition", val)}
                    options={[{value: "New", label: "New"}, {value: "Used", label: "Used"}]}
                    className="h-[50px] border-zinc-200 dark:border-zinc-700 dark:bg-zinc-800"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Mileage (km)</label>
                  <input required type="number" min="0" value={formData.mileage} onChange={e => update("mileage", parseInt(e.target.value))} className="w-full h-[50px] px-3 border border-zinc-200 rounded-lg dark:bg-zinc-800 dark:border-zinc-700" />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Transmission</label>
                  <Select 
                    value={formData.transmission || "Automatic"} 
                    onChange={val => update("transmission", val)}
                    options={[{value: "Automatic", label: "Automatic"}, {value: "Manual", label: "Manual"}]}
                    className="h-[50px] border-zinc-200 dark:border-zinc-700 dark:bg-zinc-800"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Fuel Type</label>
                  <Select 
                    value={formData.fuelType || "Petrol"} 
                    onChange={val => update("fuelType", val)}
                    options={[
                      {value: "Petrol", label: "Petrol"}, 
                      {value: "Diesel", label: "Diesel"},
                      {value: "Hybrid", label: "Hybrid"},
                      {value: "Electric", label: "Electric"}
                    ]}
                    className="h-[50px] border-zinc-200 dark:border-zinc-700 dark:bg-zinc-800"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Availability</label>
                  <Select 
                    value={formData.availability || "IN_CONGO"} 
                    onChange={val => update("availability", val)}
                    options={[
                      {value: "IN_CONGO", label: "Available in Congo"}, 
                      {value: "IMPORT", label: "Available for Import"}
                    ]}
                    className="h-[50px] border-zinc-200 dark:border-zinc-700 dark:bg-zinc-800"
                  />
                </div>
              </div>
            </div>
          )}

          {step === 2 && (
            <div className="space-y-6 animate-in fade-in slide-in-from-right-4">
              <h2 className="text-xl font-bold mb-4">Pricing</h2>
              <div>
                <label className="block text-sm font-medium mb-1">Price (USD)</label>
                <div className="relative">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-500">$</span>
                  <input required type="number" min="1" value={formData.price || ""} onChange={e => update("price", parseInt(e.target.value))} className="w-full p-3 pl-8 border rounded-lg dark:bg-zinc-800 dark:border-zinc-700 text-xl font-bold" placeholder="0" />
                </div>
              </div>
              <div className="flex items-center gap-2">
                <input type="checkbox" id="neg" checked={formData.isNegotiable} onChange={e => update("isNegotiable", e.target.checked)} className="w-4 h-4 text-primary" />
                <label htmlFor="neg" className="text-sm font-medium">Price is negotiable</label>
              </div>
              <div className="flex items-center gap-2">
                <input type="checkbox" id="fin" checked={formData.financeAvailable} onChange={e => update("financeAvailable", e.target.checked)} className="w-4 h-4 text-primary" />
                <label htmlFor="fin" className="text-sm font-medium">Finance available</label>
              </div>
            </div>
          )}

          {step === 3 && (
            <div className="space-y-6 animate-in fade-in slide-in-from-right-4">
              <h2 className="text-xl font-bold mb-4">Vehicle Details</h2>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1">Exterior Color</label>
                  <input type="text" value={formData.color} onChange={e => update("color", e.target.value)} className="w-full p-3 border rounded-lg dark:bg-zinc-800 dark:border-zinc-700" placeholder="e.g. White" />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Doors</label>
                  <input type="number" value={formData.doors} onChange={e => update("doors", parseInt(e.target.value))} className="w-full p-3 border rounded-lg dark:bg-zinc-800 dark:border-zinc-700" />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Seats</label>
                  <input type="number" value={formData.seats} onChange={e => update("seats", parseInt(e.target.value))} className="w-full p-3 border rounded-lg dark:bg-zinc-800 dark:border-zinc-700" />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Engine Size</label>
                  <input type="text" value={formData.engineSize || ""} onChange={e => update("engineSize", e.target.value)} className="w-full p-3 border rounded-lg dark:bg-zinc-800 dark:border-zinc-700" placeholder="e.g. 2.0L" />
                </div>
              </div>
            </div>
          )}

          {step === 4 && (
            <div className="space-y-6 animate-in fade-in slide-in-from-right-4">
              <h2 className="text-xl font-bold mb-4">Features</h2>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                {FEATURES_LIST.map(feat => {
                  const selected = (formData.features || []).includes(feat);
                  return (
                    <button
                      key={feat}
                      type="button"
                      onClick={() => handleFeatureToggle(feat)}
                      className={`p-3 text-left border rounded-lg text-sm transition-colors flex items-center justify-between ${selected ? "border-primary bg-primary/5 text-primary font-medium" : "dark:border-zinc-700 text-zinc-600 dark:text-zinc-400 hover:bg-zinc-50 dark:hover:bg-zinc-800"}`}
                    >
                      {feat}
                      {selected && <Check className="w-4 h-4" />}
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {step === 5 && (
            <div className="space-y-6 animate-in fade-in slide-in-from-right-4">
              <h2 className="text-xl font-bold mb-4">Photos</h2>
              <div className="border-2 border-dashed border-zinc-300 dark:border-zinc-700 rounded-xl p-12 text-center flex flex-col items-center justify-center bg-zinc-50 dark:bg-zinc-900/50">
                <Upload className="w-10 h-10 text-zinc-400 mb-4" />
                <h3 className="text-lg font-medium mb-2">Upload vehicle photos</h3>
                <p className="text-sm text-zinc-500 mb-6">Drag and drop images, or click to browse</p>
                <p className="text-xs text-primary bg-primary/10 px-3 py-1 rounded-full">(For MVP, a dummy image is already attached)</p>
              </div>
            </div>
          )}

          {step === 6 && (
            <div className="space-y-6 animate-in fade-in slide-in-from-right-4">
              <h2 className="text-xl font-bold mb-4">Description</h2>
              <div>
                <label className="block text-sm font-medium mb-1">Tell buyers about this vehicle</label>
                <textarea 
                  required
                  rows={6}
                  value={formData.description}
                  onChange={e => update("description", e.target.value)}
                  className="w-full p-4 border rounded-lg dark:bg-zinc-800 dark:border-zinc-700 resize-none"
                  placeholder="Describe the condition, history, and why it's a great buy..."
                />
              </div>
            </div>
          )}

          {step === 7 && (
            <div className="space-y-6 animate-in fade-in slide-in-from-right-4">
              <h2 className="text-xl font-bold mb-4">Review & Submit</h2>
              <div className="bg-zinc-50 dark:bg-zinc-900/50 rounded-xl p-6 border border-zinc-200 dark:border-zinc-800">
                <h3 className="text-lg font-bold mb-2">{formData.year} {formData.make} {formData.model}</h3>
                <p className="text-2xl font-bold text-primary mb-6">${formData.price?.toLocaleString()}</p>
                
                <div className="grid grid-cols-2 gap-y-3 text-sm">
                  <div className="text-zinc-500">Mileage</div>
                  <div className="font-medium">{formData.mileage?.toLocaleString()} km</div>
                  
                  <div className="text-zinc-500">Transmission</div>
                  <div className="font-medium">{formData.transmission}</div>
                  
                  <div className="text-zinc-500">Fuel</div>
                  <div className="font-medium">{formData.fuelType}</div>
                  
                  <div className="text-zinc-500">Condition</div>
                  <div className="font-medium">{formData.condition}</div>
                </div>
              </div>
              <div className="bg-amber-50 dark:bg-amber-900/20 text-amber-800 dark:text-amber-400 p-4 rounded-lg text-sm flex items-start gap-3">
                <span className="text-lg">ℹ️</span>
                <p>Your listing will be submitted to our administrators for review. Once approved, it will go live on the marketplace.</p>
              </div>
            </div>
          )}

          <div className="flex items-center justify-between mt-8 pt-6 border-t border-zinc-200 dark:border-zinc-800">
            {step > 1 ? (
              <button type="button" onClick={() => setStep(step - 1)} className="flex items-center gap-2 px-4 py-2 text-zinc-600 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-white transition-colors">
                <ChevronLeft className="w-5 h-5" /> Back
              </button>
            ) : <div />}
            
            <button type="submit" disabled={isSubmitting} className="flex items-center gap-2 bg-primary text-white px-6 py-2.5 rounded-lg font-semibold hover:bg-primary/90 transition-colors disabled:opacity-50">
              {step === 7 ? (isSubmitting ? "Submitting..." : "Submit Listing") : "Next Step"}
              {step < 7 && <ChevronRight className="w-5 h-5" />}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
