"use client";

import { useState, useEffect } from "react";
import { useRouter, Link } from "@/i18n/routing";
import { createListing, updateListing, getAuthUser } from "@/lib/actions";
import { 
  Check, ChevronLeft, ChevronRight, Upload, X, Star, 
  Image as ImageIcon, AlertCircle, Info, Sparkles, Loader2 
} from "lucide-react";
import { ExtendedVehicleListing } from "@/lib/db/schema";
import { Select } from "@/components/ui/Select";
import { useTranslations } from "next-intl";
import { MAKES_AND_MODELS } from "@/lib/search-constants";
import Image from "next/image";

// Categorized features definitions matching requirements
const CATEGORIZED_FEATURES = [
  {
    key: "comfort",
    features: [
      "Climatisation", "Sièges en cuir", "Vitres électriques", "Verrouillage centralisé",
      "Direction assistée", "Toit ouvrant", "Sièges chauffants", "Sièges ventilés"
    ],
  },
  {
    key: "safety",
    features: [
      "ABS", "Airbags", "Contrôle de stabilité (ESP)", "Antipatinage",
      "Alarme", "Antidémarrage", "Fixations ISOFIX"
    ],
  },
  {
    key: "technology",
    features: [
      "Bluetooth", "Apple CarPlay", "Android Auto", "GPS / Navigation",
      "Écran tactile", "Port USB", "Prise AUX", "Système multimédia", "Tableau de bord numérique"
    ],
  },
  {
    key: "parkingDriving",
    features: [
      "Caméra de recul", "Radars de stationnement", "Caméra 360°", "Régulateur de vitesse",
      "Régulateur de vitesse adaptatif", "Démarrage sans clé", "Démarrage par bouton", "Accès sans clé"
    ],
  },
  {
    key: "exterior",
    features: [
      "Jantes en alliage", "Phares LED", "Phares antibrouillard", "Phares Xenon",
      "Feux de jour", "Rétroviseurs électriques", "Rails de toit"
    ],
  },
  {
    key: "drivetrainPerformance",
    features: [
      "Mode Sport", "Mode Éco", "Aide à la descente", "Blocage de différentiel"
    ],
  },
];

interface PostCarPageProps {
  isAdminPortal?: boolean;
  redirectOnSuccess?: string;
  initialData?: Partial<ExtendedVehicleListing>;
  listingId?: string;
}

const PREDEFINED_COLORS = ["Blanc", "Noir", "Gris", "Argent", "Bleu", "Rouge", "Vert", "Marron", "Beige", "Jaune", "Orange", "Violet"];

export default function PostCarPage({
  isAdminPortal = false,
  redirectOnSuccess,
  initialData,
  listingId,
}: PostCarPageProps = {}) {
  const router = useRouter();
  const t = useTranslations("VehicleWizard");

  const [step, setStep] = useState(1);
  const [currentUser, setCurrentUser] = useState<{ id: string; role: string; name: string } | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isUploadingPhotos, setIsUploadingPhotos] = useState(false);
  const [uploadProgressText, setUploadProgressText] = useState("");
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [customMake, setCustomMake] = useState("");
  const [customModel, setCustomModel] = useState("");
  const [customCity, setCustomCity] = useState("");
  const [customExteriorColor, setCustomExteriorColor] = useState("");
  const [customInteriorColor, setCustomInteriorColor] = useState("");
  const [photoUrlInput, setPhotoUrlInput] = useState("");
  const [showUrlInput, setShowUrlInput] = useState(false);

  useEffect(() => {
    getAuthUser().then(user => {
      setCurrentUser(user);
      if (user && (user.role === "ADMIN" || user.role === "SUPER_ADMIN") && !isAdminPortal) {
        router.replace("/admin/dashboard/listings/create");
      }
    }).catch(() => setCurrentUser(null));
  }, [isAdminPortal, router]);

  const isSuperAdmin = isAdminPortal || currentUser?.role === "SUPER_ADMIN" || currentUser?.role === "ADMIN";

  const currentYear = new Date().getFullYear();

  const [formData, setFormData] = useState<Partial<ExtendedVehicleListing>>({
    make: initialData?.make || "",
    model: initialData?.model || "",
    year: initialData?.year !== undefined ? initialData.year : undefined,
    condition: initialData?.condition || "EXCELLENT",
    mileage: initialData?.mileage,
    transmission: initialData?.transmission || "Automatic",
    fuelType: initialData?.fuelType || "Petrol",
    availability: initialData?.availability || "IN_CONGO",
    listingAvailability: initialData?.listingAvailability || "AVAILABLE",
    saleType: initialData?.saleType || "Vente directe",
    vehicleType: initialData?.vehicleType || "SUV",
    drivetrain: initialData?.drivetrain || "4WD",
    steeringSide: initialData?.steeringSide || "LEFT",
    seats: initialData?.seats || 5,
    price: initialData?.price || 0,
    isNegotiable: initialData?.isNegotiable !== undefined ? initialData.isNegotiable : true,
    financeAvailable: initialData?.financeAvailable || false,
    color: initialData?.color || "Blanc",
    originalColor: (initialData?.originalColor === "Repeinte" || initialData?.originalColor === "Repeint") ? "Repeinte" : (initialData?.originalColor || "Couleur d'origine"),
    isFullOptions: initialData?.isFullOptions || (initialData?.vehicleOptions?.includes("Full options") ?? false),
    plateStatus: initialData?.plateStatus || (initialData?.vehicleOptions?.includes("Sans plaque") ? "WITHOUT_PLATE" : "WITH_PLATE"),
    vehicleOptions: initialData?.vehicleOptions || ["Avec plaque"],
    interiorColor: initialData?.interiorColor || "Noir",
    doors: initialData?.doors || 4,
    engineSize: initialData?.engineSize || "2.0",
    horsepower: initialData?.horsepower || 150,
    features: initialData?.features || [],
    images: initialData?.images || [],
    serviceHistory: initialData?.serviceHistory || "FULL",
    accidentHistory: initialData?.accidentHistory || "NONE",
    isImported: initialData?.isImported || false,
    importYear: initialData?.importYear || currentYear - 1,
    documents: initialData?.documents || ["carte_rose", "certificat_immat"],
    customsStatus: initialData?.customsStatus || "CLEARED",
    city: initialData?.city || "Kinshasa",
    commune: initialData?.commune || "Gombe",
    description: initialData?.description || "",
    source: initialData?.source || "OTHER",
    sourceUrl: initialData?.sourceUrl || "",
    contactOptions: initialData?.contactOptions || {
      allowCalls: true,
      allowWhatsapp: true,
      allowDirectMessage: false,
    },
  });

  const update = (key: keyof ExtendedVehicleListing, value: any) => {
    setFormData(prev => ({ ...prev, [key]: value }));
    // Clear error on edit
    if (errors[key]) {
      setErrors(prev => {
        const next = { ...prev };
        delete next[key];
        return next;
      });
    }
  };

  const handleFeatureToggle = (feat: string) => {
    setFormData(prev => {
      const feats = prev.features || [];
      if (feats.includes(feat)) return { ...prev, features: feats.filter(f => f !== feat) };
      return { ...prev, features: [...feats, feat] };
    });
  };

  const handleFullOptionsToggle = () => {
    setFormData(prev => {
      const nextFullOptions = !prev.isFullOptions;
      let nextOptions = [...(prev.vehicleOptions || [])].filter(o => o !== "Full options");
      if (nextFullOptions) {
        nextOptions.push("Full options");
      }
      return {
        ...prev,
        isFullOptions: nextFullOptions,
        vehicleOptions: nextOptions,
      };
    });
  };

  const handlePlateStatusChange = (status: "WITH_PLATE" | "WITHOUT_PLATE") => {
    setFormData(prev => {
      let nextOptions = [...(prev.vehicleOptions || [])].filter(o => o !== "Avec plaque" && o !== "Sans plaque");
      if (status === "WITH_PLATE") {
        nextOptions.push("Avec plaque");
      } else {
        nextOptions.push("Sans plaque");
      }
      return {
        ...prev,
        plateStatus: status,
        vehicleOptions: nextOptions,
      };
    });
  };

  const handleDocumentToggle = (doc: string) => {
    setFormData(prev => {
      const docs = prev.documents || [];
      if (docs.includes(doc)) return { ...prev, documents: docs.filter(d => d !== doc) };
      return { ...prev, documents: [...docs, doc] };
    });
  };

  const handleAddPhotoUrl = () => {
    const trimmed = photoUrlInput.trim();
    if (!trimmed) return;
    setFormData(prev => ({
      ...prev,
      images: [...(prev.images || []), trimmed],
    }));
    setPhotoUrlInput("");
    setErrors(prev => {
      if (!prev.images) return prev;
      const next = { ...prev };
      delete next.images;
      return next;
    });
  };

  // Automatically clear photo validation error as soon as at least one photo exists
  useEffect(() => {
    if (formData.images && formData.images.length > 0) {
      setErrors(prev => {
        if (!prev.images) return prev;
        const next = { ...prev };
        delete next.images;
        return next;
      });
    }
  }, [formData.images?.length]);

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    setIsUploadingPhotos(true);
    const fileList = Array.from(files);

    try {
      for (let i = 0; i < fileList.length; i++) {
        const file = fileList[i];
        setUploadProgressText(`Téléversement de la photo ${i + 1}/${fileList.length}...`);

        // Upload through same-origin API route to Cloudflare R2 (avoiding browser CORS)
        const uploadFormData = new FormData();
        uploadFormData.append("file", file);
        uploadFormData.append("folder", "vehicles");

        const uploadRes = await fetch("/api/upload", {
          method: "POST",
          body: uploadFormData,
        });

        if (!uploadRes.ok) {
          const errData = await uploadRes.json().catch(() => ({}));
          throw new Error(errData.error || `Échec du téléversement (HTTP ${uploadRes.status})`);
        }

        const data = await uploadRes.json();
        const publicUrl = data.publicUrl;

        // Append persistent R2 public URL
        setFormData(prev => ({
          ...prev,
          images: [...(prev.images || []), publicUrl],
        }));

        setErrors(prev => {
          if (!prev.images) return prev;
          const next = { ...prev };
          delete next.images;
          return next;
        });
      }
    } catch (err: any) {
      console.error("Photo upload error:", err);
      setErrors(prev => ({
        ...prev,
        images: err.message || "Erreur lors du téléversement de la photo",
      }));
    } finally {
      setIsUploadingPhotos(false);
      setUploadProgressText("");
      e.target.value = "";
    }
  };

  const handleSetCoverPhoto = (index: number) => {
    setFormData(prev => {
      const imgs = [...(prev.images || [])];
      if (index <= 0 || index >= imgs.length) return prev;
      const [selected] = imgs.splice(index, 1);
      return { ...prev, images: [selected, ...imgs] };
    });
  };

  const handleRemovePhoto = (index: number) => {
    setFormData(prev => {
      const imgs = [...(prev.images || [])];
      imgs.splice(index, 1);
      return { ...prev, images: imgs };
    });
  };

  // Step Validation
  const validateStep = (currentStep: number): boolean => {
    const newErrors: Record<string, string> = {};

    if (currentStep === 1) {
      const makeVal = formData.make === "Autre" ? customMake.trim() : formData.make;
      if (!makeVal) newErrors.make = t("validation.requiredMake");

      const modelVal = (formData.model === "Autre" || formData.make === "Autre") ? customModel.trim() : formData.model;
      if (!modelVal) newErrors.model = t("validation.requiredModel");

      if (formData.year !== undefined && formData.year !== null && (formData.year as any) !== "" && (formData.year as any) !== "NONE") {
        const yearNum = Number(formData.year);
        if (isNaN(yearNum) || yearNum < 1950 || yearNum > currentYear + 1) {
          newErrors.year = `Veuillez indiquer une année valide (entre 1950 et ${currentYear + 1})`;
        }
      }

      if (!formData.condition) newErrors.condition = t("validation.requiredCondition");
      // Mileage is optional: only validate if a value is provided
      if (formData.mileage !== undefined && formData.mileage !== null && (formData.mileage as any) !== "") {
        const mileageNum = Number(formData.mileage);
        if (isNaN(mileageNum) || mileageNum < 0) {
          newErrors.mileage = "Le kilométrage doit être un nombre positif";
        }
      }
      if (!formData.transmission) newErrors.transmission = t("validation.requiredTransmission");
      if (!formData.fuelType) newErrors.fuelType = t("validation.requiredFuel");
      if (!formData.listingAvailability) newErrors.availability = t("validation.requiredAvailability");
    } else if (currentStep === 2) {
      if (!formData.price || formData.price <= 0 || isNaN(formData.price)) {
        newErrors.price = t("validation.requiredPrice");
      }
    } else if (currentStep === 5) {
      if (!formData.images || formData.images.length === 0) {
        newErrors.images = t("validation.requiredPhotos");
      }
    } else if (currentStep === 6) {
      const cityVal = formData.city === "Autre" ? customCity.trim() : formData.city;
      if (!cityVal) newErrors.city = t("validation.requiredCity");
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const nextStep = (e: React.FormEvent) => {
    e.preventDefault();
    if (isUploadingPhotos) return;
    if (!validateStep(step)) return;

    if (step < 7) {
      setStep(step + 1);
      window.scrollTo({ top: 0, behavior: "smooth" });
    } else {
      handleSubmit();
    }
  };

  const prevStep = () => {
    if (step > 1) {
      setStep(step - 1);
      setErrors({});
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  };

  const handleSubmit = async () => {
    setIsSubmitting(true);

    const resolvedMake = formData.make === "Autre" ? customMake.trim() : (formData.make || "");
    const resolvedModel = (formData.model === "Autre" || formData.make === "Autre") ? customModel.trim() : (formData.model || "");
    const resolvedCity = formData.city === "Autre" ? customCity.trim() : (formData.city || "Kinshasa");
    const resolvedColor = formData.color === "Autre" ? (customExteriorColor.trim() || "Autre") : (formData.color || "Blanc");
    const resolvedOriginalColor = formData.originalColor || "Couleur d'origine";
    const resolvedInteriorColor = formData.interiorColor === "Autre" ? (customInteriorColor.trim() || "Autre") : (formData.interiorColor || "Noir");
    const resolvedMileage = (formData.mileage !== undefined && formData.mileage !== null && (formData.mileage as any) !== "")
      ? Math.max(0, Number(formData.mileage))
      : undefined;

    const payload: Partial<ExtendedVehicleListing> = {
      ...formData,
      make: resolvedMake,
      model: resolvedModel,
      city: resolvedCity,
      color: resolvedColor,
      originalColor: resolvedOriginalColor,
      saleType: formData.saleType || "Vente directe",
      isFullOptions: Boolean(formData.isFullOptions),
      plateStatus: formData.plateStatus || "WITH_PLATE",
      vehicleOptions: formData.vehicleOptions || (formData.plateStatus === "WITHOUT_PLATE" ? ["Sans plaque"] : ["Avec plaque"]),
      interiorColor: resolvedInteriorColor,
      mileage: resolvedMileage,
      year: (formData.year && !isNaN(Number(formData.year)) && Number(formData.year) > 0)
        ? Number(formData.year)
        : undefined,
      title: (formData.year && !isNaN(Number(formData.year)) && Number(formData.year) > 0)
        ? `${Number(formData.year)} ${resolvedMake} ${resolvedModel}`
        : `${resolvedMake} ${resolvedModel}`,
    };

    let res;
    if (listingId) {
      res = await updateListing(listingId, payload);
    } else {
      res = await createListing(payload);
    }
    if (res.success) {
      router.push(redirectOnSuccess || (isAdminPortal ? "/admin/listings" : "/dashboard/listings"));
    }
    setIsSubmitting(false);
  };

  // Makes and models lists
  const availableMakes = MAKES_AND_MODELS.map(m => m.make);
  const currentMakeModels = formData.make
    ? MAKES_AND_MODELS.find(m => m.make === formData.make)?.models.map(mod => mod.name) || []
    : [];

  return (
    <div className="max-w-4xl mx-auto space-y-6 pb-20 px-4">
      {/* Wizard Header & Progress */}
      <div className="space-y-3 mb-6">
        <div className="flex items-center gap-2 text-sm text-zinc-500 mb-1">
          <Link
            href={isAdminPortal ? "/admin/listings" : "/dashboard/listings"}
            className="hover:text-primary flex items-center gap-1 font-medium transition-colors"
          >
            <ChevronLeft className="w-4 h-4" />
            {isAdminPortal ? "Retour aux annonces admin" : "Retour à mes annonces"}
          </Link>
        </div>
        <div className="flex items-center justify-between">
          <h1 className="text-2xl sm:text-3xl font-bold text-zinc-900 dark:text-zinc-100">
            {isAdminPortal ? "Publier un véhicule (Portail Admin)" : t("pageTitle")}
          </h1>
          <span className="text-sm font-semibold text-primary bg-primary/10 px-3 py-1 rounded-full">
            {t("stepCounter", { step })}
          </span>
        </div>

        {/* Progress Bar */}
        <div className="w-full bg-zinc-200 dark:bg-zinc-800 h-2.5 rounded-full overflow-hidden">
          <div 
            className="h-full bg-primary transition-all duration-300 ease-out" 
            style={{ width: `${(step / 7) * 100}%` }} 
          />
        </div>

        {/* Step Indicator Title */}
        <p className="text-sm text-zinc-500 dark:text-zinc-400 font-medium">
          {t(`steps.${step}` as any)}
        </p>
      </div>

      {/* Main Card */}
      <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl p-6 sm:p-8 shadow-sm">
        <form onSubmit={nextStep}>

          {/* ========================================================= */}
          {/* STEP 1: INFORMATIONS DU VÉHICULE                          */}
          {/* ========================================================= */}
          {step === 1 && (
            <div className="space-y-8 animate-in fade-in">
              {/* Section 1: Informations principales */}
              <div>
                <h2 className="text-xl font-bold mb-1 text-zinc-900 dark:text-zinc-100">
                  {t("step1.mainTitle")}
                </h2>
                <div className="h-0.5 w-10 bg-primary mb-6" />

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                  {/* Marque */}
                  <div>
                    <label className="block text-sm font-medium mb-1.5 text-zinc-700 dark:text-zinc-300">
                      {t("step1.makeLabel")} <span className="text-red-500">*</span>
                    </label>
                    <Select
                      value={formData.make || ""}
                      onChange={val => {
                        update("make", val);
                        update("model", "");
                      }}
                      placeholder={t("step1.makePlaceholder")}
                      options={[
                        ...availableMakes.map(m => ({ value: m, label: m })),
                        { value: "Autre", label: t("step1.otherOption") },
                      ]}
                      className="h-[48px]"
                    />
                    {formData.make === "Autre" && (
                      <input
                        type="text"
                        value={customMake}
                        onChange={e => setCustomMake(e.target.value)}
                        placeholder="Préciser la marque"
                        className="mt-2 w-full h-[46px] px-3.5 border border-zinc-300 dark:border-zinc-700 rounded-lg dark:bg-zinc-800 text-sm"
                      />
                    )}
                    {errors.make && <p className="text-red-500 text-xs mt-1.5">{errors.make}</p>}
                  </div>

                  {/* Modèle */}
                  <div>
                    <label className="block text-sm font-medium mb-1.5 text-zinc-700 dark:text-zinc-300">
                      {t("step1.modelLabel")} <span className="text-red-500">*</span>
                    </label>
                    <Select
                      value={formData.model || ""}
                      onChange={val => update("model", val)}
                      placeholder={t("step1.modelPlaceholder")}
                      disabled={!formData.make}
                      options={[
                        ...currentMakeModels.map(mod => ({ value: mod, label: mod })),
                        { value: "Autre", label: t("step1.otherOption") },
                      ]}
                      className="h-[48px]"
                    />
                    {(formData.model === "Autre" || formData.make === "Autre") && (
                      <input
                        type="text"
                        value={customModel}
                        onChange={e => setCustomModel(e.target.value)}
                        placeholder={t("step1.customModelPlaceholder")}
                        className="mt-2 w-full h-[46px] px-3.5 border border-zinc-300 dark:border-zinc-700 rounded-lg dark:bg-zinc-800 text-sm"
                      />
                    )}
                    {errors.model && <p className="text-red-500 text-xs mt-1.5">{errors.model}</p>}
                  </div>

                  {/* Année */}
                  <div>
                    <div className="flex items-center justify-between mb-1.5">
                      <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300">
                        {t("step1.yearLabel")} <span className="text-xs font-normal text-zinc-400">(Optionnel)</span>
                      </label>
                      {formData.year ? (
                        <button
                          type="button"
                          onClick={() => {
                            update("year", undefined);
                            if (errors.year) {
                              setErrors(prev => {
                                const n = { ...prev };
                                delete n.year;
                                return n;
                              });
                            }
                          }}
                          className="text-[11px] text-zinc-400 hover:text-red-500 transition-colors cursor-pointer"
                        >
                          Effacer
                        </button>
                      ) : null}
                    </div>
                    <Select
                      value={formData.year ? String(formData.year) : (formData.year === null ? "NONE" : "")}
                      onChange={val => {
                        update("year", (val && val !== "NONE") ? parseInt(val) : null);
                        if (errors.year) {
                          setErrors(prev => {
                            const n = { ...prev };
                            delete n.year;
                            return n;
                          });
                        }
                      }}
                      placeholder="Sélectionner l'année..."
                      options={[
                        { value: "NONE", label: t("step1.yearUnspecified") || "Non précisée" },
                        ...Array.from({ length: currentYear - 1970 + 2 }, (_, i) => currentYear + 1 - i).map(y => ({
                          value: String(y),
                          label: String(y)
                        }))
                      ]}
                      className="h-[48px] w-full"
                    />
                    {errors.year && <p className="text-red-500 text-xs mt-1.5">{errors.year}</p>}
                  </div>

                  {/* État du véhicule */}
                  <div>
                    <label className="block text-sm font-medium mb-1.5 text-zinc-700 dark:text-zinc-300">
                      {t("step1.conditionLabel")} <span className="text-red-500">*</span>
                    </label>
                    <Select
                      value={formData.condition || "EXCELLENT"}
                      onChange={val => update("condition", val)}
                      options={[
                        { value: "NEW", label: t("step1.conditionOptions.NEW") },
                        { value: "LIKE_NEW", label: t("step1.conditionOptions.LIKE_NEW") },
                        { value: "EXCELLENT", label: t("step1.conditionOptions.EXCELLENT") },
                        { value: "GOOD", label: t("step1.conditionOptions.GOOD") },
                        { value: "FAIR", label: t("step1.conditionOptions.FAIR") },
                        { value: "FOR_REPAIR", label: t("step1.conditionOptions.FOR_REPAIR") },
                      ]}
                      className="h-[48px]"
                    />
                    {errors.condition && <p className="text-red-500 text-xs mt-1.5">{errors.condition}</p>}
                  </div>

                  {/* Kilométrage */}
                  <div>
                    <div className="flex items-center justify-between mb-1.5">
                      <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300">
                        {t("step1.mileageLabel")} <span className="text-xs font-normal text-zinc-400">(Optionnel)</span>
                      </label>
                      {formData.mileage !== undefined && formData.mileage !== null && (formData.mileage as any) !== "" && Number(formData.mileage) > 0 ? (
                        <button
                          type="button"
                          onClick={() => update("mileage", "")}
                          className="text-[11px] text-zinc-400 hover:text-red-500 transition-colors cursor-pointer"
                        >
                          Effacer
                        </button>
                      ) : null}
                    </div>
                    <div className="relative">
                      <input
                        type="text"
                        inputMode="numeric"
                        placeholder="Ex: 45000 (ou laisser vide)"
                        value={formData.mileage === undefined || formData.mileage === null ? "" : String(formData.mileage)}
                        onChange={e => {
                          const val = e.target.value.replace(/[^0-9]/g, "");
                          update("mileage", val === "" ? "" : parseInt(val));
                        }}
                        className="w-full h-[48px] px-3.5 pr-12 border border-zinc-300 dark:border-zinc-700 rounded-lg dark:bg-zinc-800 text-sm font-medium"
                      />
                      <span className="absolute right-3.5 top-1/2 -translate-y-1/2 text-sm text-zinc-400 font-medium pointer-events-none">km</span>
                    </div>
                    {errors.mileage && <p className="text-red-500 text-xs mt-1.5">{errors.mileage}</p>}
                  </div>

                  {/* Boîte de vitesses */}
                  <div>
                    <label className="block text-sm font-medium mb-1.5 text-zinc-700 dark:text-zinc-300">
                      {t("step1.transmissionLabel")} <span className="text-red-500">*</span>
                    </label>
                    <Select
                      value={formData.transmission || "Automatic"}
                      onChange={val => update("transmission", val)}
                      options={[
                        { value: "Automatic", label: t("step1.transmissionOptions.Automatic") },
                        { value: "Manual", label: t("step1.transmissionOptions.Manual") },
                        { value: "Semi-Automatic", label: t("step1.transmissionOptions.Semi-Automatic") },
                      ]}
                      className="h-[48px]"
                    />
                    {errors.transmission && <p className="text-red-500 text-xs mt-1.5">{errors.transmission}</p>}
                  </div>

                  {/* Carburant */}
                  <div>
                    <label className="block text-sm font-medium mb-1.5 text-zinc-700 dark:text-zinc-300">
                      {t("step1.fuelLabel")} <span className="text-red-500">*</span>
                    </label>
                    <Select
                      value={formData.fuelType || "Petrol"}
                      onChange={val => update("fuelType", val)}
                      options={[
                        { value: "Petrol", label: t("step1.fuelOptions.Petrol") },
                        { value: "Diesel", label: t("step1.fuelOptions.Diesel") },
                        { value: "Hybrid", label: t("step1.fuelOptions.Hybrid") },
                        { value: "Electric", label: t("step1.fuelOptions.Electric") },
                      ]}
                      className="h-[48px]"
                    />
                    {errors.fuelType && <p className="text-red-500 text-xs mt-1.5">{errors.fuelType}</p>}
                  </div>

                  {/* Disponibilité */}
                  <div>
                    <label className="block text-sm font-medium mb-1.5 text-zinc-700 dark:text-zinc-300">
                      {t("step1.availabilityLabel")} <span className="text-red-500">*</span>
                    </label>
                    <Select
                      value={formData.listingAvailability || "AVAILABLE"}
                      onChange={val => update("listingAvailability", val)}
                      options={[
                        { value: "AVAILABLE", label: t("step1.availabilityOptions.AVAILABLE") },
                        { value: "SOLD", label: t("step1.availabilityOptions.SOLD") },
                        { value: "RESERVED", label: t("step1.availabilityOptions.RESERVED") },
                      ]}
                      className="h-[48px]"
                    />
                    {errors.availability && <p className="text-red-500 text-xs mt-1.5">{errors.availability}</p>}
                  </div>

                  {/* Type de vente */}
                  <div>
                    <label className="block text-sm font-medium mb-1.5 text-zinc-700 dark:text-zinc-300">
                      {t("step1.saleTypeLabel")} <span className="text-red-500">*</span>
                    </label>
                    <Select
                      value={formData.saleType || "Vente directe"}
                      onChange={val => update("saleType", val)}
                      options={[
                        { value: "Vente directe", label: t("step1.saleTypeOptions.DIRECT") },
                        { value: "Semi directe", label: t("step1.saleTypeOptions.SEMI_DIRECT") },
                        { value: "Indirecte", label: t("step1.saleTypeOptions.INDIRECT") },
                        { value: "Non spécifié", label: t("step1.saleTypeOptions.UNSPECIFIED") },
                      ]}
                      className="h-[48px]"
                    />
                  </div>
                </div>
              </div>

              {/* Section 2: Informations complémentaires */}
              <div className="pt-6 border-t border-zinc-100 dark:border-zinc-800">
                <h2 className="text-xl font-bold mb-1 text-zinc-900 dark:text-zinc-100">
                  {t("step1.additionalTitle")}
                </h2>
                <div className="h-0.5 w-10 bg-primary mb-6" />

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                  {/* Type de véhicule */}
                  <div>
                    <label className="block text-sm font-medium mb-1.5 text-zinc-700 dark:text-zinc-300">
                      {t("step1.vehicleTypeLabel")}
                    </label>
                    <Select
                      value={formData.vehicleType || "SUV"}
                      onChange={val => update("vehicleType", val)}
                      options={[
                        { value: "Berline", label: t("step1.vehicleTypeOptions.Berline") },
                        { value: "SUV", label: t("step1.vehicleTypeOptions.SUV") },
                        { value: "4x4", label: t("step1.vehicleTypeOptions.4x4") },
                        { value: "Pick-up", label: t("step1.vehicleTypeOptions.Pick-up") },
                        { value: "Coupé", label: t("step1.vehicleTypeOptions.Coupé") },
                        { value: "Cabriolet", label: t("step1.vehicleTypeOptions.Cabriolet") },
                        { value: "Break", label: t("step1.vehicleTypeOptions.Break") },
                        { value: "Monospace", label: t("step1.vehicleTypeOptions.Monospace") },
                        { value: "Minibus", label: t("step1.vehicleTypeOptions.Minibus") },
                        { value: "Bus", label: t("step1.vehicleTypeOptions.Bus") },
                        { value: "Camionnette", label: t("step1.vehicleTypeOptions.Camionnette") },
                        { value: "Autre", label: t("step1.vehicleTypeOptions.Autre") },
                      ]}
                      className="h-[48px]"
                    />
                  </div>

                  {/* Motricité */}
                  <div>
                    <label className="block text-sm font-medium mb-1.5 text-zinc-700 dark:text-zinc-300">
                      {t("step1.drivetrainLabel")}
                    </label>
                    <Select
                      value={formData.drivetrain || "4WD"}
                      onChange={val => update("drivetrain", val)}
                      options={[
                        { value: "2WD", label: t("step1.drivetrainOptions.2WD") },
                        { value: "4WD", label: t("step1.drivetrainOptions.4WD") },
                      ]}
                      className="h-[48px]"
                    />
                  </div>

                  {/* Position du volant */}
                  <div>
                    <label className="block text-sm font-medium mb-1.5 text-zinc-700 dark:text-zinc-300">
                      {t("step1.steeringSideLabel")}
                    </label>
                    <Select
                      value={formData.steeringSide || "LEFT"}
                      onChange={val => update("steeringSide", val)}
                      options={[
                        { value: "LEFT", label: t("step1.steeringSideOptions.LEFT") },
                        { value: "RIGHT", label: t("step1.steeringSideOptions.RIGHT") },
                      ]}
                      className="h-[48px]"
                    />
                  </div>

                  {/* Nombre de places */}
                  <div>
                    <label className="block text-sm font-medium mb-1.5 text-zinc-700 dark:text-zinc-300">
                      {t("step1.seatsLabel")}
                    </label>
                    <Select
                      value={String(formData.seats || 5)}
                      onChange={val => update("seats", parseInt(val) || 5)}
                      options={[
                        { value: "2", label: t("step1.seatsOptions.2") },
                        { value: "4", label: t("step1.seatsOptions.4") },
                        { value: "5", label: t("step1.seatsOptions.5") },
                        { value: "6", label: t("step1.seatsOptions.6") },
                        { value: "7", label: t("step1.seatsOptions.7") },
                        { value: "8", label: t("step1.seatsOptions.8+") },
                      ]}
                      className="h-[48px]"
                    />
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* ========================================================= */}
          {/* STEP 2: PRIX                                              */}
          {/* ========================================================= */}
          {step === 2 && (
            <div className="space-y-6 animate-in fade-in">
              <h2 className="text-xl font-bold mb-1 text-zinc-900 dark:text-zinc-100">
                {t("step2.title")}
              </h2>
              <div className="h-0.5 w-10 bg-primary mb-6" />

              <div className="max-w-md space-y-6">
                <div>
                  <label className="block text-sm font-medium mb-2 text-zinc-700 dark:text-zinc-300">
                    {t("step2.priceLabel")} <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-xl font-bold text-zinc-400">
                      {t("step2.currency")}
                    </span>
                    <input
                      type="number"
                      min={1}
                      value={formData.price || ""}
                      onChange={e => update("price", Math.max(0, parseInt(e.target.value) || 0))}
                      className="w-full h-14 pl-10 pr-4 text-2xl font-bold border border-zinc-300 dark:border-zinc-700 rounded-xl dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 focus:ring-2 focus:ring-primary focus:border-primary"
                      placeholder="0"
                    />
                  </div>
                  {errors.price && <p className="text-red-500 text-xs mt-1.5">{errors.price}</p>}
                </div>

                <div className="space-y-3 pt-2">
                  <label className="flex items-center gap-3 p-3.5 rounded-xl border border-zinc-200 dark:border-zinc-800 hover:bg-zinc-50 dark:hover:bg-zinc-800/50 cursor-pointer transition-colors">
                    <input
                      type="checkbox"
                      checked={!!formData.isNegotiable}
                      onChange={e => update("isNegotiable", e.target.checked)}
                      className="w-5 h-5 rounded text-primary focus:ring-primary"
                    />
                    <span className="text-sm font-medium text-zinc-800 dark:text-zinc-200">
                      {t("step2.negotiable")}
                    </span>
                  </label>

                  <label className="flex items-center gap-3 p-3.5 rounded-xl border border-zinc-200 dark:border-zinc-800 hover:bg-zinc-50 dark:hover:bg-zinc-800/50 cursor-pointer transition-colors">
                    <input
                      type="checkbox"
                      checked={!!formData.financeAvailable}
                      onChange={e => update("financeAvailable", e.target.checked)}
                      className="w-5 h-5 rounded text-primary focus:ring-primary"
                    />
                    <span className="text-sm font-medium text-zinc-800 dark:text-zinc-200">
                      {t("step2.financing")}
                    </span>
                  </label>
                </div>
              </div>
            </div>
          )}

          {/* ========================================================= */}
          {/* STEP 3: DÉTAILS DU VÉHICULE                               */}
          {/* ========================================================= */}
          {step === 3 && (
            <div className="space-y-8 animate-in fade-in">
              {/* Section: Apparence */}
              <div>
                <h2 className="text-xl font-bold mb-1 text-zinc-900 dark:text-zinc-100">
                  {t("step3.appearanceTitle")}
                </h2>
                <div className="h-0.5 w-10 bg-primary mb-6" />

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
                  {/* Couleur extérieure */}
                  <div>
                    <label className="block text-sm font-medium mb-1.5 text-zinc-700 dark:text-zinc-300">
                      {t("step3.exteriorColorLabel")}
                    </label>
                    <Select
                      value={formData.color || "Blanc"}
                      onChange={val => update("color", val)}
                      options={[
                        { value: "Noir", label: t("step3.colorOptions.Noir") },
                        { value: "Blanc", label: t("step3.colorOptions.Blanc") },
                        { value: "Gris", label: t("step3.colorOptions.Gris") },
                        { value: "Argent", label: t("step3.colorOptions.Argent") },
                        { value: "Bleu", label: t("step3.colorOptions.Bleu") },
                        { value: "Rouge", label: t("step3.colorOptions.Rouge") },
                        { value: "Vert", label: t("step3.colorOptions.Vert") },
                        { value: "Marron", label: t("step3.colorOptions.Marron") },
                        { value: "Beige", label: t("step3.colorOptions.Beige") },
                        { value: "Jaune", label: t("step3.colorOptions.Jaune") },
                        { value: "Orange", label: t("step3.colorOptions.Orange") },
                        { value: "Violet", label: t("step3.colorOptions.Violet") },
                        { value: "Autre", label: t("step3.colorOptions.Autre") },
                      ]}
                      className="h-[48px]"
                    />
                    {formData.color === "Autre" && (
                      <input
                        type="text"
                        value={customExteriorColor}
                        onChange={e => setCustomExteriorColor(e.target.value)}
                        placeholder="Précisez la couleur extérieure (ex: Bleu Nuit, Bordeaux...)"
                        className="mt-2 w-full h-[46px] px-3.5 border border-zinc-300 dark:border-zinc-700 rounded-lg dark:bg-zinc-800 text-sm animate-in fade-in"
                      />
                    )}
                  </div>

                  {/* Couleur d'origine */}
                  <div>
                    <label className="block text-sm font-medium mb-1.5 text-zinc-700 dark:text-zinc-300">
                      {t("step3.originalColorLabel")}
                    </label>
                    <Select
                      value={formData.originalColor || "Couleur d'origine"}
                      onChange={val => update("originalColor", val)}
                      options={[
                        { value: "Couleur d'origine", label: t("step3.originalColorOptions.ORIGINAL") },
                        { value: "Repeinte", label: t("step3.originalColorOptions.REPAINTED") },
                      ]}
                      className="h-[48px]"
                    />
                  </div>

                  {/* Couleur intérieure */}
                  <div>
                    <label className="block text-sm font-medium mb-1.5 text-zinc-700 dark:text-zinc-300">
                      {t("step3.interiorColorLabel")}
                    </label>
                    <Select
                      value={formData.interiorColor || "Noir"}
                      onChange={val => update("interiorColor", val)}
                      options={[
                        { value: "Noir", label: t("step3.interiorColorOptions.Noir") },
                        { value: "Beige", label: t("step3.interiorColorOptions.Beige") },
                        { value: "Gris", label: t("step3.interiorColorOptions.Gris") },
                        { value: "Marron", label: t("step3.interiorColorOptions.Marron") },
                        { value: "Blanc", label: t("step3.interiorColorOptions.Blanc") },
                        { value: "Autre", label: t("step3.interiorColorOptions.Autre") },
                      ]}
                      className="h-[48px]"
                    />
                    {formData.interiorColor === "Autre" && (
                      <input
                        type="text"
                        value={customInteriorColor}
                        onChange={e => setCustomInteriorColor(e.target.value)}
                        placeholder="Précisez la couleur intérieure (ex: Camel, Rouge Cuir...)"
                        className="mt-2 w-full h-[46px] px-3.5 border border-zinc-300 dark:border-zinc-700 rounded-lg dark:bg-zinc-800 text-sm animate-in fade-in"
                      />
                    )}
                  </div>
                </div>
              </div>

              {/* Section: Dimensions et moteur */}
              <div className="pt-6 border-t border-zinc-100 dark:border-zinc-800">
                <h2 className="text-xl font-bold mb-1 text-zinc-900 dark:text-zinc-100">
                  {t("step3.dimensionsEngineTitle")}
                </h2>
                <div className="h-0.5 w-10 bg-primary mb-6" />

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
                  {/* Nombre de portes */}
                  <div>
                    <label className="block text-sm font-medium mb-1.5 text-zinc-700 dark:text-zinc-300">
                      {t("step3.doorsLabel")}
                    </label>
                    <Select
                      value={String(formData.doors || 4)}
                      onChange={val => update("doors", parseInt(val) || 4)}
                      options={[
                        { value: "2", label: t("step3.doorsOptions.2") },
                        { value: "3", label: t("step3.doorsOptions.3") },
                        { value: "4", label: t("step3.doorsOptions.4") },
                        { value: "5", label: t("step3.doorsOptions.5") },
                        { value: "6", label: t("step3.doorsOptions.6+") },
                      ]}
                      className="h-[48px]"
                    />
                  </div>

                  {/* Cylindrée (L) */}
                  <div>
                    <label className="block text-sm font-medium mb-1.5 text-zinc-700 dark:text-zinc-300">
                      {t("step3.engineSizeLabel")}
                    </label>
                    <input
                      type="text"
                      value={formData.engineSize || ""}
                      onChange={e => update("engineSize", e.target.value)}
                      placeholder={t("step3.engineSizePlaceholder")}
                      className="w-full h-[48px] px-3.5 border border-zinc-300 dark:border-zinc-700 rounded-lg dark:bg-zinc-800 text-sm"
                    />
                  </div>

                  {/* Puissance (ch) */}
                  <div>
                    <label className="block text-sm font-medium mb-1.5 text-zinc-700 dark:text-zinc-300">
                      {t("step3.horsepowerLabel")}
                    </label>
                    <input
                      type="number"
                      min={0}
                      value={formData.horsepower || ""}
                      onChange={e => update("horsepower", Math.max(0, parseInt(e.target.value) || 0))}
                      placeholder={t("step3.horsepowerPlaceholder")}
                      className="w-full h-[48px] px-3.5 border border-zinc-300 dark:border-zinc-700 rounded-lg dark:bg-zinc-800 text-sm"
                    />
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* ========================================================= */}
          {/* STEP 4: ÉQUIPEMENTS                                       */}
          {/* ========================================================= */}
          {step === 4 && (
            <div className="space-y-8 animate-in fade-in">
              <div>
                <h2 className="text-xl font-bold mb-1 text-zinc-900 dark:text-zinc-100">
                  {t("step4.title")}
                </h2>
                <p className="text-sm text-zinc-500 dark:text-zinc-400">
                  {t("step4.subtitle")}
                </p>
                <div className="h-0.5 w-10 bg-primary mt-2 mb-6" />
              </div>

              <div className="space-y-6">
                {/* Options clés & Immatriculation */}
                <div className="bg-gradient-to-r from-primary/5 via-primary/10 to-transparent dark:from-primary/10 dark:via-primary/5 dark:to-transparent p-5 rounded-2xl border border-primary/20 space-y-4">
                  <div className="flex items-center gap-2">
                    <Sparkles className="w-5 h-5 text-primary shrink-0" />
                    <div>
                      <h3 className="font-bold text-base text-zinc-900 dark:text-zinc-100">
                        {t("step4.specialOptionsTitle")}
                      </h3>
                      <p className="text-xs text-zinc-500 dark:text-zinc-400">
                        {t("step4.specialOptionsSubtitle")}
                      </p>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-1">
                    {/* Full options Card Toggle */}
                    <div
                      onClick={handleFullOptionsToggle}
                      className={`p-4 rounded-xl border-2 cursor-pointer transition-all flex items-start gap-3.5 select-none ${
                        formData.isFullOptions
                          ? "border-primary bg-white dark:bg-zinc-900 shadow-sm shadow-primary/10"
                          : "border-zinc-200 dark:border-zinc-800 bg-white/70 dark:bg-zinc-900/60 hover:border-zinc-300 dark:hover:border-zinc-700"
                      }`}
                    >
                      <div className={`w-5 h-5 mt-0.5 rounded flex items-center justify-center shrink-0 transition-colors ${
                        formData.isFullOptions ? "bg-primary text-white" : "border-2 border-zinc-300 dark:border-zinc-600"
                      }`}>
                        {formData.isFullOptions && <Check className="w-3.5 h-3.5" />}
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-sm text-zinc-900 dark:text-zinc-100">
                            {t("step4.fullOptionsTitle")}
                          </span>
                          <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20">
                            Premium
                          </span>
                        </div>
                        <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-1 leading-relaxed">
                          {t("step4.fullOptionsDesc")}
                        </p>
                      </div>
                    </div>

                    {/* Immatriculation: Avec plaque / Sans plaque */}
                    <div className="p-4 rounded-xl border-2 border-zinc-200 dark:border-zinc-800 bg-white/70 dark:bg-zinc-900/60 flex flex-col justify-between gap-2.5">
                      <div>
                        <span className="font-bold text-sm text-zinc-900 dark:text-zinc-100 block mb-0.5">
                          {t("step4.plateStatusLabel")}
                        </span>
                        <p className="text-xs text-zinc-500 dark:text-zinc-400">
                          Précisez si le véhicule est immatriculé avec ou sans plaque.
                        </p>
                      </div>

                      <div className="grid grid-cols-2 gap-2 pt-1">
                        <button
                          type="button"
                          onClick={() => handlePlateStatusChange("WITH_PLATE")}
                          className={`py-2.5 px-3 rounded-lg text-xs font-semibold flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                            formData.plateStatus !== "WITHOUT_PLATE"
                              ? "bg-primary text-white shadow-xs"
                              : "border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 hover:bg-zinc-50 dark:hover:bg-zinc-700/50"
                          }`}
                        >
                          {formData.plateStatus !== "WITHOUT_PLATE" && <Check className="w-3.5 h-3.5" />}
                          <span>{t("step4.withPlate")}</span>
                        </button>

                        <button
                          type="button"
                          onClick={() => handlePlateStatusChange("WITHOUT_PLATE")}
                          className={`py-2.5 px-3 rounded-lg text-xs font-semibold flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                            formData.plateStatus === "WITHOUT_PLATE"
                              ? "bg-primary text-white shadow-xs"
                              : "border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 hover:bg-zinc-50 dark:hover:bg-zinc-700/50"
                          }`}
                        >
                          {formData.plateStatus === "WITHOUT_PLATE" && <Check className="w-3.5 h-3.5" />}
                          <span>{t("step4.withoutPlate")}</span>
                        </button>
                      </div>
                    </div>
                  </div>
                </div>

                {CATEGORIZED_FEATURES.map(category => (
                  <div key={category.key} className="bg-zinc-50 dark:bg-zinc-800/40 p-4 sm:p-5 rounded-xl border border-zinc-200/80 dark:border-zinc-800">
                    <h3 className="font-semibold text-sm sm:text-base text-zinc-900 dark:text-zinc-100 mb-3 flex items-center gap-2">
                      <span className="w-2 h-2 rounded-full bg-primary" />
                      {t(`step4.categories.${category.key}` as any)}
                    </h3>

                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2.5">
                      {category.features.map(feat => {
                        const selected = (formData.features || []).includes(feat);
                        return (
                          <button
                            key={feat}
                            type="button"
                            onClick={() => handleFeatureToggle(feat)}
                            className={`p-3 text-left border rounded-lg text-xs sm:text-sm font-medium transition-all flex items-center justify-between ${
                              selected
                                ? "border-primary bg-primary/10 text-primary shadow-xs"
                                : "border-zinc-200 dark:border-zinc-700/80 bg-white dark:bg-zinc-900 text-zinc-700 dark:text-zinc-300 hover:border-zinc-300 dark:hover:border-zinc-600"
                            }`}
                          >
                            <span>{t(`step4.features.${feat}` as any)}</span>
                            {selected ? (
                              <Check className="w-4 h-4 text-primary shrink-0" />
                            ) : (
                              <span className="w-4 h-4 border border-zinc-300 dark:border-zinc-600 rounded-sm shrink-0" />
                            )}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* ========================================================= */}
          {/* STEP 5: PHOTOS                                            */}
          {/* ========================================================= */}
          {step === 5 && (
            <div className="space-y-6 animate-in fade-in">
              <div>
                <h2 className="text-xl font-bold mb-1 text-zinc-900 dark:text-zinc-100">
                  {t("step5.title")}
                </h2>
                <p className="text-sm text-zinc-500 dark:text-zinc-400">
                  {t("step5.subtitle")}
                </p>
                <div className="h-0.5 w-10 bg-primary mt-2 mb-6" />
              </div>

              {/* Recommendation banner */}
              <div className="bg-blue-50 dark:bg-blue-950/40 border border-blue-200 dark:border-blue-900/60 rounded-xl p-4 flex items-start gap-3">
                <Info className="w-5 h-5 text-blue-600 dark:text-blue-400 shrink-0 mt-0.5" />
                <p className="text-xs sm:text-sm text-blue-800 dark:text-blue-300 font-medium">
                  {t("step5.recommendation")}
                </p>
              </div>

              {/* Dropzone / Upload Area */}
              <div className="border-2 border-dashed border-zinc-300 dark:border-zinc-700 rounded-2xl p-8 sm:p-10 text-center flex flex-col items-center justify-center bg-zinc-50/70 dark:bg-zinc-900/40 hover:bg-zinc-50 dark:hover:bg-zinc-800/30 transition-colors">
                <Upload className="w-10 h-10 text-primary mb-3 stroke-[1.75]" />
                <h3 className="text-base font-semibold text-zinc-900 dark:text-zinc-100 mb-1">
                  {t("step5.subtitle")}
                </h3>
                <p className="text-xs sm:text-sm text-zinc-500 dark:text-zinc-400 mb-4 max-w-md">
                  {t("step5.dropzoneText")}
                </p>

                <div className="flex flex-wrap items-center justify-center gap-3">
                  <label className={`cursor-pointer bg-primary text-white text-xs sm:text-sm font-semibold px-5 py-2.5 rounded-lg hover:bg-primary/90 transition-colors shadow-sm flex items-center gap-2 ${isUploadingPhotos ? "opacity-60 pointer-events-none" : ""}`}>
                    {isUploadingPhotos ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        <span>{uploadProgressText || "Téléversement en cours..."}</span>
                      </>
                    ) : (
                      <>
                        <Upload className="w-4 h-4" />
                        <span>{t("step5.chooseFiles")}</span>
                      </>
                    )}
                    <input
                      type="file"
                      multiple
                      accept="image/*"
                      disabled={isUploadingPhotos}
                      onChange={handleFileUpload}
                      className="hidden"
                    />
                  </label>
                </div>
              </div>

              {/* Optional URL photo adder (hidden by default unless user clicks to add via URL) */}
              <div className="pt-1">
                {!showUrlInput ? (
                  <button
                    type="button"
                    onClick={() => setShowUrlInput(true)}
                    className="text-xs text-zinc-500 hover:text-zinc-800 dark:text-zinc-400 dark:hover:text-zinc-200 underline underline-offset-4 inline-flex items-center gap-1.5 transition-colors cursor-pointer"
                  >
                    <span>{t("step5.addUrlTitle")}</span>
                  </button>
                ) : (
                  <div className="space-y-2.5 p-3.5 bg-zinc-50 dark:bg-zinc-900/60 rounded-xl border border-zinc-200 dark:border-zinc-800 animate-in fade-in duration-150">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-medium text-zinc-700 dark:text-zinc-300">
                        {t("step5.addUrlTitle")}
                      </span>
                      <button
                        type="button"
                        onClick={() => setShowUrlInput(false)}
                        className="text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200 p-1 cursor-pointer"
                        title="Fermer"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                    <div className="flex items-center gap-2">
                      <input
                        type="url"
                        value={photoUrlInput}
                        onChange={e => setPhotoUrlInput(e.target.value)}
                        placeholder={t("step5.addUrlPlaceholder")}
                        className="flex-1 h-10 px-3.5 border border-zinc-300 dark:border-zinc-700 rounded-lg dark:bg-zinc-800 text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-primary/20"
                      />
                      <button
                        type="button"
                        onClick={() => {
                          handleAddPhotoUrl();
                          setShowUrlInput(false);
                        }}
                        className="h-10 px-4 bg-zinc-800 dark:bg-zinc-700 text-white rounded-lg text-xs sm:text-sm font-medium hover:bg-zinc-700 dark:hover:bg-zinc-600 transition-colors cursor-pointer"
                      >
                        {t("step5.addUrlButton")}
                      </button>
                    </div>
                  </div>
                )}
              </div>

              {errors.images && (!formData.images || formData.images.length === 0) && (
                <div className="flex items-center gap-2 p-3 bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-900/40 rounded-xl text-red-600 dark:text-red-400 text-xs sm:text-sm animate-in fade-in">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>{errors.images}</span>
                </div>
              )}

              {/* Photos Grid Preview */}
              {formData.images && formData.images.length > 0 && (
                <div className="space-y-2 pt-2">
                  <span className="text-xs font-semibold text-zinc-500 block uppercase tracking-wider">
                    {formData.images.length} {formData.images.length > 1 ? "photos" : "photo"}
                  </span>
                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                    {formData.images.map((img, index) => {
                      const isMain = index === 0;
                      return (
                        <div
                          key={index}
                          className={`relative group rounded-xl overflow-hidden aspect-4/3 bg-zinc-100 dark:bg-zinc-800 border-2 transition-all ${
                            isMain
                              ? "border-primary shadow-md ring-2 ring-primary/20"
                              : "border-zinc-200 dark:border-zinc-700"
                          }`}
                        >
                          <Image
                            src={img}
                            alt={`Car photo ${index + 1}`}
                            fill
                            className="object-cover"
                            unoptimized={img.startsWith("data:")}
                          />

                          {/* Cover badge */}
                          {isMain && (
                            <span className="absolute top-2 left-2 z-10 bg-primary text-white text-[10px] font-bold px-2 py-1 rounded-md shadow-sm flex items-center gap-1">
                              <Star className="w-3 h-3 fill-white" />
                              {t("step5.mainPhoto")}
                            </span>
                          )}

                          {/* Hover action overlay */}
                          <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col justify-between p-2">
                            <div className="flex justify-end">
                              <button
                                type="button"
                                onClick={() => handleRemovePhoto(index)}
                                title={t("step5.remove")}
                                className="p-1 bg-red-600 hover:bg-red-700 text-white rounded-md transition-colors"
                              >
                                <X className="w-3.5 h-3.5" />
                              </button>
                            </div>

                            {!isMain && (
                              <button
                                type="button"
                                onClick={() => handleSetCoverPhoto(index)}
                                className="w-full text-center py-1 bg-white/90 hover:bg-white text-zinc-900 text-[11px] font-semibold rounded-md shadow-sm transition-colors"
                              >
                                {t("step5.setAsMain")}
                              </button>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* ========================================================= */}
          {/* STEP 6: DESCRIPTION                                       */}
          {/* ========================================================= */}
          {step === 6 && (
            <div className="space-y-8 animate-in fade-in">
              <div>
                <h2 className="text-xl font-bold mb-1 text-zinc-900 dark:text-zinc-100">
                  {t("step6.title")}
                </h2>
                <p className="text-sm text-zinc-500 dark:text-zinc-400">
                  {t("step6.subtitle")}
                </p>
                <div className="h-0.5 w-10 bg-primary mt-2 mb-6" />
              </div>

              {/* Section: Historique du véhicule */}
              <div>
                <h3 className="font-semibold text-base mb-4 text-zinc-900 dark:text-zinc-100">
                  {t("step6.historyTitle")}
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                  <div>
                    <label className="block text-sm font-medium mb-1.5 text-zinc-700 dark:text-zinc-300">
                      {t("step6.serviceHistoryLabel")}
                    </label>
                    <Select
                      value={formData.serviceHistory || "FULL"}
                      onChange={val => update("serviceHistory", val)}
                      options={[
                        { value: "FULL", label: t("step6.serviceHistoryOptions.FULL") },
                        { value: "PARTIAL", label: t("step6.serviceHistoryOptions.PARTIAL") },
                        { value: "NONE", label: t("step6.serviceHistoryOptions.NONE") },
                        { value: "UNKNOWN", label: t("step6.serviceHistoryOptions.UNKNOWN") },
                      ]}
                      className="h-[48px]"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-1.5 text-zinc-700 dark:text-zinc-300">
                      {t("step6.accidentHistoryLabel")}
                    </label>
                    <Select
                      value={formData.accidentHistory || "NONE"}
                      onChange={val => update("accidentHistory", val)}
                      options={[
                        { value: "NONE", label: t("step6.accidentHistoryOptions.NONE") },
                        { value: "ACCIDENTED", label: t("step6.accidentHistoryOptions.ACCIDENTED") },
                        { value: "UNKNOWN", label: t("step6.accidentHistoryOptions.UNKNOWN") },
                      ]}
                      className="h-[48px]"
                    />
                  </div>
                </div>
              </div>

              {/* Section: Informations d'importation */}
              <div className="pt-6 border-t border-zinc-100 dark:border-zinc-800">
                <h3 className="font-semibold text-base mb-4 text-zinc-900 dark:text-zinc-100">
                  {t("step6.importTitle")}
                </h3>

                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium mb-2 text-zinc-700 dark:text-zinc-300">
                      {t("step6.isImportedLabel")}
                    </label>
                    <div className="flex gap-4">
                      <label className="flex items-center gap-2 cursor-pointer">
                        <input
                          type="radio"
                          name="isImported"
                          checked={!formData.isImported}
                          onChange={() => update("isImported", false)}
                          className="w-4 h-4 text-primary"
                        />
                        <span className="text-sm text-zinc-800 dark:text-zinc-200">{t("step6.no")}</span>
                      </label>
                      <label className="flex items-center gap-2 cursor-pointer">
                        <input
                          type="radio"
                          name="isImported"
                          checked={!!formData.isImported}
                          onChange={() => update("isImported", true)}
                          className="w-4 h-4 text-primary"
                        />
                        <span className="text-sm text-zinc-800 dark:text-zinc-200">{t("step6.yes")}</span>
                      </label>
                    </div>
                  </div>

                  {formData.isImported && (
                    <div className="bg-zinc-50 dark:bg-zinc-800/40 p-5 rounded-xl border border-zinc-200 dark:border-zinc-800 space-y-5 animate-in fade-in">
                      {/* Année d'importation */}
                      <div>
                        <label className="block text-sm font-medium mb-1.5 text-zinc-700 dark:text-zinc-300">
                          {t("step6.importYearLabel")}
                        </label>
                        <input
                          type="number"
                          min={1990}
                          max={currentYear + 1}
                          value={formData.importYear || ""}
                          onChange={e => update("importYear", parseInt(e.target.value) || currentYear)}
                          className="w-full sm:w-60 h-[46px] px-3.5 border border-zinc-300 dark:border-zinc-700 rounded-lg dark:bg-zinc-800 text-sm"
                        />
                      </div>

                      {/* Documents disponibles */}
                      <div>
                        <label className="block text-sm font-medium mb-2 text-zinc-700 dark:text-zinc-300">
                          {t("step6.documentsLabel")}
                        </label>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                          {["carte_rose", "certificat_immat", "douane", "autres"].map(docKey => {
                            const checked = (formData.documents || []).includes(docKey);
                            return (
                              <label
                                key={docKey}
                                className={`flex items-center gap-3 p-3 rounded-lg border text-xs sm:text-sm cursor-pointer transition-colors ${
                                  checked
                                    ? "border-primary bg-primary/5 text-primary font-medium"
                                    : "border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-900 text-zinc-700 dark:text-zinc-300"
                                }`}
                              >
                                <input
                                  type="checkbox"
                                  checked={checked}
                                  onChange={() => handleDocumentToggle(docKey)}
                                  className="w-4 h-4 text-primary rounded"
                                />
                                <span>{t(`step6.documentsOptions.${docKey}` as any)}</span>
                              </label>
                            );
                          })}
                        </div>
                      </div>

                      {/* Situation douanière */}
                      <div>
                        <label className="block text-sm font-medium mb-1.5 text-zinc-700 dark:text-zinc-300">
                          {t("step6.customsStatusLabel")}
                        </label>
                        <Select
                          value={formData.customsStatus || "CLEARED"}
                          onChange={val => update("customsStatus", val)}
                          options={[
                            { value: "CLEARED", label: t("step6.customsStatusOptions.CLEARED") },
                            { value: "IN_PROGRESS", label: t("step6.customsStatusOptions.IN_PROGRESS") },
                            { value: "NOT_AVAILABLE", label: t("step6.customsStatusOptions.NOT_AVAILABLE") },
                            { value: "UNKNOWN", label: t("step6.customsStatusOptions.UNKNOWN") },
                          ]}
                          className="h-[46px] max-w-sm"
                        />
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Section: Localisation */}
              <div className="pt-6 border-t border-zinc-100 dark:border-zinc-800">
                <h3 className="font-semibold text-base mb-4 text-zinc-900 dark:text-zinc-100">
                  {t("step6.locationTitle")}
                </h3>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                  {/* Ville */}
                  <div>
                    <label className="block text-sm font-medium mb-1.5 text-zinc-700 dark:text-zinc-300">
                      {t("step6.cityLabel")} <span className="text-red-500">*</span>
                    </label>
                    <Select
                      value={formData.city || "Kinshasa"}
                      onChange={val => update("city", val)}
                      placeholder={t("step6.cityPlaceholder")}
                      options={[
                        { value: "Kinshasa", label: t("step6.cityOptions.Kinshasa") },
                        { value: "Lubumbashi", label: t("step6.cityOptions.Lubumbashi") },
                        { value: "Goma", label: t("step6.cityOptions.Goma") },
                        { value: "Kisangani", label: t("step6.cityOptions.Kisangani") },
                        { value: "Bukavu", label: t("step6.cityOptions.Bukavu") },
                        { value: "Kolwezi", label: t("step6.cityOptions.Kolwezi") },
                        { value: "Matadi", label: t("step6.cityOptions.Matadi") },
                        { value: "Mbuji-Mayi", label: t("step6.cityOptions.Mbuji-Mayi") },
                        { value: "Kananga", label: t("step6.cityOptions.Kananga") },
                        { value: "Autre", label: t("step6.cityOptions.Autre") },
                      ]}
                      className="h-[48px]"
                    />
                    {formData.city === "Autre" && (
                      <input
                        type="text"
                        value={customCity}
                        onChange={e => setCustomCity(e.target.value)}
                        placeholder="Indiquer la ville"
                        className="mt-2 w-full h-[46px] px-3.5 border border-zinc-300 dark:border-zinc-700 rounded-lg dark:bg-zinc-800 text-sm"
                      />
                    )}
                    {errors.city && <p className="text-red-500 text-xs mt-1.5">{errors.city}</p>}
                  </div>

                  {/* Commune / Quartier */}
                  <div>
                    <label className="block text-sm font-medium mb-1.5 text-zinc-700 dark:text-zinc-300">
                      {t("step6.communeLabel")}
                    </label>
                    <input
                      type="text"
                      value={formData.commune || ""}
                      onChange={e => update("commune", e.target.value)}
                      placeholder={t("step6.communePlaceholder")}
                      className="w-full h-[48px] px-3.5 border border-zinc-300 dark:border-zinc-700 rounded-lg dark:bg-zinc-800 text-sm"
                    />
                  </div>
                </div>
              </div>

              {/* Free-text description */}
              <div className="pt-6 border-t border-zinc-100 dark:border-zinc-800">
                <label className="block text-sm font-medium mb-2 text-zinc-700 dark:text-zinc-300">
                  {t("step6.title")}
                </label>
                <textarea
                  rows={5}
                  value={formData.description || ""}
                  onChange={e => update("description", e.target.value)}
                  className="w-full p-4 border border-zinc-300 dark:border-zinc-700 rounded-xl dark:bg-zinc-800 text-sm text-zinc-900 dark:text-zinc-100 resize-none focus:ring-2 focus:ring-primary focus:border-primary"
                  placeholder={t("step6.placeholder")}
                />
              </div>

              {/* Super Admin: Source et Canaux de Contact */}
              {isSuperAdmin && (
                <div className="pt-6 border-t border-zinc-100 dark:border-zinc-800 bg-amber-50/60 dark:bg-amber-950/20 p-5 rounded-2xl border border-amber-200 dark:border-amber-800/50 space-y-5">
                  <div className="flex items-center gap-2 text-amber-700 dark:text-amber-400">
                    <Sparkles className="w-5 h-5 shrink-0" />
                    <h3 className="font-bold text-base">Configuration Super Admin : Source & Moyens de contact</h3>
                  </div>
                  <p className="text-xs text-zinc-600 dark:text-zinc-400">
                    Indiquez la provenance de cette annonce si elle est importée depuis un réseau social. Vous pouvez également contrôler les canaux de contact disponibles pour les acheteurs.
                  </p>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {/* Plateforme source */}
                    <div>
                      <label className="block text-sm font-medium mb-1.5 text-zinc-700 dark:text-zinc-300">
                        Plateforme Source
                      </label>
                      <Select
                        value={formData.source || "OTHER"}
                        onChange={val => update("source", val)}
                        options={[
                          { value: "FACEBOOK", label: "Facebook" },
                          { value: "TIKTOK", label: "TikTok" },
                          { value: "WHATSAPP", label: "WhatsApp" },
                          { value: "INSTAGRAM", label: "Instagram" },
                          { value: "OTHER", label: "Autre / Site Web" },
                        ]}
                        className="h-[48px]"
                      />
                    </div>

                    {/* URL source */}
                    <div>
                      <label className="block text-sm font-medium mb-1.5 text-zinc-700 dark:text-zinc-300">
                        Lien URL du post original
                      </label>
                      <input
                        type="url"
                        value={formData.sourceUrl || ""}
                        onChange={e => update("sourceUrl", e.target.value)}
                        placeholder="https://facebook.com/... ou https://tiktok.com/@..."
                        className="w-full h-[48px] px-3.5 border border-zinc-300 dark:border-zinc-700 rounded-lg dark:bg-zinc-800 text-sm"
                      />
                    </div>
                  </div>

                  {/* Options de contact */}
                  <div>
                    <label className="block text-sm font-medium mb-2 text-zinc-700 dark:text-zinc-300">
                      Canaux de contact autorisés pour cette annonce
                    </label>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <label className="flex items-center gap-3 p-3 bg-white dark:bg-zinc-900 rounded-xl border border-zinc-200 dark:border-zinc-700 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={formData.contactOptions?.allowCalls !== false}
                          onChange={e => update("contactOptions", { ...(formData.contactOptions || {}), allowCalls: e.target.checked })}
                          className="w-4 h-4 text-primary rounded"
                        />
                        <div>
                          <span className="text-sm font-semibold text-zinc-900 dark:text-white block">Appels téléphoniques</span>
                          <span className="text-xs text-zinc-500">Permettre aux acheteurs d'appeler directement</span>
                        </div>
                      </label>

                      <label className="flex items-center gap-3 p-3 bg-white dark:bg-zinc-900 rounded-xl border border-zinc-200 dark:border-zinc-700 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={formData.contactOptions?.allowWhatsapp !== false}
                          onChange={e => update("contactOptions", { ...(formData.contactOptions || {}), allowWhatsapp: e.target.checked })}
                          className="w-4 h-4 text-primary rounded"
                        />
                        <div>
                          <span className="text-sm font-semibold text-zinc-900 dark:text-white block">Messages WhatsApp</span>
                          <span className="text-xs text-zinc-500">Afficher le bouton de discussion WhatsApp</span>
                        </div>
                      </label>
                    </div>
                    {formData.sourceUrl && (
                      <p className="text-xs text-primary font-medium mt-2 flex items-center gap-1.5">
                        <Check className="w-3.5 h-3.5" />
                        Un bouton direct vers l'annonce originale sera affiché sur la fiche véhicule pour contacter le vendeur.
                      </p>
                    )}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* ========================================================= */}
          {/* STEP 7: VÉRIFICATION ET PUBLICATION                       */}
          {/* ========================================================= */}
          {step === 7 && (
            <div className="space-y-8 animate-in fade-in">
              <div>
                <h2 className="text-xl font-bold mb-1 text-zinc-900 dark:text-zinc-100">
                  {t("step7.title")}
                </h2>
                <p className="text-sm text-zinc-500 dark:text-zinc-400">
                  {t("step7.previewSubtitle")}
                </p>
                <div className="h-0.5 w-10 bg-primary mt-2 mb-6" />
              </div>

              {/* Preview Card */}
              <div className="bg-zinc-50 dark:bg-zinc-800/50 rounded-2xl p-6 sm:p-7 border border-zinc-200 dark:border-zinc-800 space-y-6">
                {/* Header Summary */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-zinc-200 dark:border-zinc-700">
                  <div>
                    <span className="text-xs font-semibold text-primary uppercase tracking-wider block mb-1">
                      {formData.vehicleType || "Véhicule"}
                    </span>
                    <h3 className="text-2xl font-bold text-zinc-900 dark:text-zinc-100">
                      {formData.year ? `${formData.year} ` : ""}{formData.make === "Autre" ? customMake : formData.make} {formData.model === "Autre" ? customModel : formData.model}
                    </h3>
                    <p className="text-sm text-zinc-500 dark:text-zinc-400 mt-1">
                      {formData.commune ? `${formData.commune}, ` : ""}{formData.city === "Autre" ? customCity : formData.city}, RDC
                    </p>
                  </div>
                  <div className="text-left sm:text-right">
                    <span className="text-3xl font-extrabold text-primary block">
                      ${formData.price?.toLocaleString()}
                    </span>
                    {formData.isNegotiable && (
                      <span className="inline-block mt-1 text-xs text-zinc-500 bg-zinc-200/80 dark:bg-zinc-700 px-2 py-0.5 rounded font-medium">
                        {t("step2.negotiable")}
                      </span>
                    )}
                  </div>
                </div>

                {/* Photos Row */}
                {formData.images && formData.images.length > 0 && (
                  <div>
                    <h4 className="text-xs font-bold text-zinc-500 uppercase tracking-wider mb-3">
                      {t("step7.photosLabel")} ({formData.images.length})
                    </h4>
                    <div className="flex items-center gap-3 overflow-x-auto pb-2">
                      {formData.images.map((img, i) => (
                        <div key={i} className="relative w-28 h-20 shrink-0 rounded-lg overflow-hidden border border-zinc-200 dark:border-zinc-700 bg-zinc-200">
                          <Image src={img} alt={`Preview ${i + 1}`} fill className="object-cover" unoptimized={img.startsWith("data:")} />
                          {i === 0 && (
                            <span className="absolute bottom-1 left-1 bg-primary/90 text-white text-[9px] font-bold px-1.5 py-0.5 rounded">
                              {t("step5.mainPhoto")}
                            </span>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Key specs grid */}
                <div>
                  <h4 className="text-xs font-bold text-zinc-500 uppercase tracking-wider mb-3">
                    Caractéristiques
                  </h4>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-sm bg-white dark:bg-zinc-900 p-4 rounded-xl border border-zinc-200 dark:border-zinc-800">
                    <div>
                      <span className="text-zinc-500 text-xs block">{t("step1.yearLabel")}</span>
                      <span className="font-semibold text-zinc-900 dark:text-zinc-100">
                        {formData.year || t("step1.yearUnspecified") || "Non précisée"}
                      </span>
                    </div>
                    <div>
                      <span className="text-zinc-500 text-xs block">{t("step7.mileageLabel")}</span>
                      <span className="font-semibold text-zinc-900 dark:text-zinc-100">
                        {formData.mileage ? `${formData.mileage.toLocaleString()} km` : "Non spécifié"}
                      </span>
                    </div>
                    <div>
                      <span className="text-zinc-500 text-xs block">{t("step7.transmissionLabel")}</span>
                      <span className="font-semibold text-zinc-900 dark:text-zinc-100">
                        {formData.transmission}
                      </span>
                    </div>
                    <div>
                      <span className="text-zinc-500 text-xs block">{t("step7.fuelLabel")}</span>
                      <span className="font-semibold text-zinc-900 dark:text-zinc-100">
                        {formData.fuelType}
                      </span>
                    </div>
                    <div>
                      <span className="text-zinc-500 text-xs block">{t("step7.conditionLabel")}</span>
                      <span className="font-semibold text-zinc-900 dark:text-zinc-100">
                        {t(`step1.conditionOptions.${formData.condition}` as any)}
                      </span>
                    </div>
                    <div>
                      <span className="text-zinc-500 text-xs block">{t("step1.drivetrainLabel")}</span>
                      <span className="font-semibold text-zinc-900 dark:text-zinc-100">
                        {formData.drivetrain ? t(`step1.drivetrainOptions.${formData.drivetrain}` as any) : "N/A"}
                      </span>
                    </div>
                    <div>
                      <span className="text-zinc-500 text-xs block">{t("step3.exteriorColorLabel")}</span>
                      <span className="font-semibold text-zinc-900 dark:text-zinc-100">
                        {formData.color === "Autre" ? (customExteriorColor || "Autre") : (formData.color || "N/A")}
                      </span>
                    </div>
                    <div>
                      <span className="text-zinc-500 text-xs block">{t("step3.interiorColorLabel")}</span>
                      <span className="font-semibold text-zinc-900 dark:text-zinc-100">
                        {formData.interiorColor === "Autre" ? (customInteriorColor || "Autre") : (formData.interiorColor || "N/A")}
                      </span>
                    </div>
                    <div>
                      <span className="text-zinc-500 text-xs block">{t("step7.saleTypeLabel")}</span>
                      <span className="font-semibold text-zinc-900 dark:text-zinc-100">
                        {formData.saleType === "Semi directe"
                          ? t("step1.saleTypeOptions.SEMI_DIRECT")
                          : formData.saleType === "Indirecte"
                          ? t("step1.saleTypeOptions.INDIRECT")
                          : formData.saleType === "Non spécifié"
                          ? t("step1.saleTypeOptions.UNSPECIFIED")
                          : t("step1.saleTypeOptions.DIRECT")}
                      </span>
                    </div>
                    <div>
                      <span className="text-zinc-500 text-xs block">{t("step7.originalColorLabel")}</span>
                      <span className="font-semibold text-zinc-900 dark:text-zinc-100">
                        {formData.originalColor === "Repeinte"
                          ? t("step3.originalColorOptions.REPAINTED")
                          : t("step3.originalColorOptions.ORIGINAL")}
                      </span>
                    </div>
                    <div>
                      <span className="text-zinc-500 text-xs block">{t("step7.plateStatusLabel")}</span>
                      <span className="font-semibold text-zinc-900 dark:text-zinc-100">
                        {formData.plateStatus === "WITHOUT_PLATE" ? t("step4.withoutPlate") : t("step4.withPlate")}
                      </span>
                    </div>
                    <div>
                      <span className="text-zinc-500 text-xs block">{t("step1.seatsLabel")}</span>
                      <span className="font-semibold text-zinc-900 dark:text-zinc-100">
                        {formData.seats} places
                      </span>
                    </div>
                  </div>
                </div>

                {/* Features Grouped */}
                {(formData.isFullOptions || (formData.features && formData.features.length > 0)) && (
                  <div>
                    <h4 className="text-xs font-bold text-zinc-500 uppercase tracking-wider mb-2">
                      {t("step7.featuresLabel")} {(formData.features?.length || 0) + (formData.isFullOptions ? 1 : 0)}
                    </h4>
                    <div className="flex flex-wrap gap-2">
                      {formData.isFullOptions && (
                        <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-amber-500/10 text-amber-700 dark:text-amber-400 border border-amber-500/20 rounded-full text-xs font-bold">
                          <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                          Full options
                        </span>
                      )}
                      {(formData.features || []).map(feat => (
                        <span
                          key={feat}
                          className="inline-flex items-center gap-1.5 px-3 py-1 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-full text-xs font-medium text-zinc-800 dark:text-zinc-200"
                        >
                          <Check className="w-3.5 h-3.5 text-primary" />
                          {t(`step4.features.${feat}` as any)}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {/* History & Import info */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs pt-4 border-t border-zinc-200 dark:border-zinc-700">
                  <div>
                    <span className="font-semibold text-zinc-700 dark:text-zinc-300 block mb-1">
                      {t("step6.historyTitle")}:
                    </span>
                    <p className="text-zinc-600 dark:text-zinc-400">
                      Entretien: {t(`step6.serviceHistoryOptions.${formData.serviceHistory}` as any)} • Accident: {t(`step6.accidentHistoryOptions.${formData.accidentHistory}` as any)}
                    </p>
                  </div>
                  <div>
                    <span className="font-semibold text-zinc-700 dark:text-zinc-300 block mb-1">
                      {t("step6.importTitle")}:
                    </span>
                    <p className="text-zinc-600 dark:text-zinc-400">
                      {formData.isImported
                        ? `Importé (${formData.importYear || "N/A"}) • Douane: ${t(`step6.customsStatusOptions.${formData.customsStatus}` as any)}`
                        : "Véhicule local en RDC"}
                    </p>
                  </div>
                </div>

                {/* Description */}
                {formData.description && (
                  <div className="pt-4 border-t border-zinc-200 dark:border-zinc-700">
                    <h4 className="text-xs font-bold text-zinc-500 uppercase tracking-wider mb-1.5">
                      {t("step7.descriptionLabel")}
                    </h4>
                    <p className="text-sm text-zinc-700 dark:text-zinc-300 whitespace-pre-line leading-relaxed">
                      {formData.description}
                    </p>
                  </div>
                )}
              </div>

              {/* Moderation Notice */}
              <div className="bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-900/50 text-amber-900 dark:text-amber-300 p-4 rounded-xl text-sm flex items-start gap-3">
                <AlertCircle className="w-5 h-5 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" />
                <p className="leading-relaxed">
                  {t("step7.moderationNotice")}
                </p>
              </div>
            </div>
          )}

          {/* Navigation Controls */}
          <div className="flex items-center justify-between mt-8 pt-6 border-t border-zinc-200 dark:border-zinc-800">
            {step > 1 ? (
              <button
                type="button"
                onClick={prevStep}
                className="flex items-center gap-2 px-5 py-2.5 rounded-xl border border-zinc-300 dark:border-zinc-700 text-zinc-700 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800 font-medium text-sm transition-colors cursor-pointer"
              >
                <ChevronLeft className="w-4 h-4" />
                {t("buttons.back")}
              </button>
            ) : (
              <div />
            )}

            <button
              type="submit"
              disabled={isSubmitting || isUploadingPhotos}
              className="flex items-center gap-2 bg-primary hover:bg-primary/90 text-white px-7 py-2.5 rounded-xl font-semibold text-sm transition-all shadow-sm hover:shadow disabled:opacity-50 cursor-pointer"
            >
              {isUploadingPhotos ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>{uploadProgressText || "Téléversement..."}</span>
                </>
              ) : step === 7 ? (
                isSubmitting ? t("buttons.submitting") : t("buttons.submit")
              ) : (
                <>
                  {t("buttons.next")}
                  <ChevronRight className="w-4 h-4" />
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
