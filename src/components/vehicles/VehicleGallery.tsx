"use client";

import { useState } from "react";
import Image from "next/image";
import { Badge } from "@/components/ui/Badge";
import { ChevronLeft, ChevronRight, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { useTranslations } from "next-intl";

export function VehicleGallery({ images, title, isLocal }: { images: string[], title: string, isLocal: boolean }) {
  const [activeIdx, setActiveIdx] = useState(0);
  const [isLightboxOpen, setIsLightboxOpen] = useState(false);
  const t = useTranslations("Vehicles");

  const nextImg = (e?: React.MouseEvent) => {
    e?.stopPropagation();
    setActiveIdx((prev) => (prev + 1) % images.length);
  };

  const prevImg = (e?: React.MouseEvent) => {
    e?.stopPropagation();
    setActiveIdx((prev) => (prev - 1 + images.length) % images.length);
  };

  return (
    <>
      <div className="space-y-4">
        {/* Main Image */}
        <div 
          className="relative aspect-[4/3] sm:aspect-[16/9] bg-zinc-100 rounded-2xl overflow-hidden cursor-pointer group"
          onClick={() => setIsLightboxOpen(true)}
        >
          <Image
            src={images[activeIdx]}
            alt={`${title} - Image ${activeIdx + 1}`}
            fill
            className="object-cover transition-transform duration-500 group-hover:scale-105"
            sizes="(max-width: 1024px) 100vw, 66vw"
            priority
          />
          
          <div className="absolute top-4 left-4 flex gap-2 z-10">
            {isLocal ? (
              <span className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs sm:text-sm font-bold bg-emerald-600 text-white shadow-md border border-emerald-500/40">
                <span>✓</span>
                <span>{t("availableInCongo")}</span>
              </span>
            ) : (
              <span className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs sm:text-sm font-bold bg-blue-600 text-white shadow-md border border-blue-500/40">
                <span>🚢</span>
                <span>{t("availableForImport")}</span>
              </span>
            )}
          </div>

          {images.length > 1 && (
            <>
              <button 
                onClick={prevImg}
                className="absolute left-4 top-1/2 -translate-y-1/2 w-10 h-10 bg-white/80 hover:bg-white rounded-full flex items-center justify-center shadow-md backdrop-blur-sm opacity-0 group-hover:opacity-100 transition-opacity z-10"
              >
                <ChevronLeft className="w-6 h-6 text-zinc-900" />
              </button>
              <button 
                onClick={nextImg}
                className="absolute right-4 top-1/2 -translate-y-1/2 w-10 h-10 bg-white/80 hover:bg-white rounded-full flex items-center justify-center shadow-md backdrop-blur-sm opacity-0 group-hover:opacity-100 transition-opacity z-10"
              >
                <ChevronRight className="w-6 h-6 text-zinc-900" />
              </button>
            </>
          )}
        </div>

        {/* Thumbnails */}
        {images.length > 1 && (
          <div className="grid grid-cols-4 sm:grid-cols-6 gap-3">
            {images.map((img, idx) => (
              <button
                key={idx}
                onClick={() => setActiveIdx(idx)}
                className={cn(
                  "relative aspect-[4/3] rounded-lg overflow-hidden border-2 transition-all",
                  activeIdx === idx ? "border-primary shadow-sm" : "border-transparent opacity-70 hover:opacity-100"
                )}
              >
                <Image src={img} alt="" fill className="object-cover" sizes="150px" />
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Lightbox */}
      {isLightboxOpen && (
        <div className="fixed inset-0 z-[200] bg-zinc-950/95 backdrop-blur-md flex flex-col">
          <div className="p-4 flex justify-between items-center text-white border-b border-white/10">
            <span className="font-medium">{title} ({activeIdx + 1} / {images.length})</span>
            <button 
              onClick={() => setIsLightboxOpen(false)}
              className="p-2 hover:bg-white/10 rounded-full transition-colors"
            >
              <X className="w-6 h-6" />
            </button>
          </div>
          
          <div className="flex-1 relative flex items-center justify-center p-4 sm:p-10">
            <Image
              src={images[activeIdx]}
              alt={`${title} - Image ${activeIdx + 1}`}
              fill
              className="object-contain"
              sizes="100vw"
            />
            
            {images.length > 1 && (
              <>
                <button 
                  onClick={prevImg}
                  className="absolute left-4 sm:left-10 top-1/2 -translate-y-1/2 w-12 h-12 bg-black/50 hover:bg-black/80 rounded-full flex items-center justify-center text-white transition-colors z-10"
                >
                  <ChevronLeft className="w-8 h-8" />
                </button>
                <button 
                  onClick={nextImg}
                  className="absolute right-4 sm:right-10 top-1/2 -translate-y-1/2 w-12 h-12 bg-black/50 hover:bg-black/80 rounded-full flex items-center justify-center text-white transition-colors z-10"
                >
                  <ChevronRight className="w-8 h-8" />
                </button>
              </>
            )}
          </div>
        </div>
      )}
    </>
  );
}
