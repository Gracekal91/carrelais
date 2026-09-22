"use client";

import * as React from "react";
import Image from "next/image";
import { Camera, ChevronLeft, ChevronRight, Maximize2 } from "lucide-react";

interface ListingPhotoGalleryProps {
  images: string[];
  title: string;
}

export default function ListingPhotoGallery({ images, title }: ListingPhotoGalleryProps) {
  const [selectedIndex, setSelectedIndex] = React.useState(0);

  if (!images || images.length === 0) {
    return (
      <div className="bg-zinc-100 dark:bg-zinc-800 rounded-2xl h-64 flex flex-col items-center justify-center text-zinc-400 gap-2 border border-zinc-200 dark:border-zinc-700">
        <Camera className="w-8 h-8 opacity-40" />
        <span className="text-xs font-medium">Aucune photo disponible pour cette annonce</span>
      </div>
    );
  }

  const currentImage = images[selectedIndex] || images[0];

  const handlePrev = () => {
    setSelectedIndex((prev) => (prev > 0 ? prev - 1 : images.length - 1));
  };

  const handleNext = () => {
    setSelectedIndex((prev) => (prev < images.length - 1 ? prev + 1 : 0));
  };

  return (
    <div className="space-y-3">
      {/* Main Image Viewer */}
      <div className="relative aspect-16/10 w-full rounded-2xl overflow-hidden bg-zinc-900 border border-zinc-200 dark:border-zinc-800 group shadow-sm">
        <Image
          src={currentImage}
          alt={`${title} - Photo ${selectedIndex + 1}`}
          fill
          priority
          className="object-cover transition-transform duration-300"
        />

        {/* Counter Badge */}
        <div className="absolute top-3 right-3 px-3 py-1 rounded-full bg-black/60 backdrop-blur-md text-white text-xs font-semibold tracking-wide">
          Photo {selectedIndex + 1} / {images.length}
        </div>

        {/* Navigation arrows if multiple images */}
        {images.length > 1 && (
          <>
            <button
              type="button"
              onClick={handlePrev}
              className="absolute left-3 top-1/2 -translate-y-1/2 p-2 rounded-full bg-black/50 hover:bg-black/70 text-white backdrop-blur-xs transition-opacity cursor-pointer"
              aria-label="Previous photo"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
            <button
              type="button"
              onClick={handleNext}
              className="absolute right-3 top-1/2 -translate-y-1/2 p-2 rounded-full bg-black/50 hover:bg-black/70 text-white backdrop-blur-xs transition-opacity cursor-pointer"
              aria-label="Next photo"
            >
              <ChevronRight className="w-5 h-5" />
            </button>
          </>
        )}
      </div>

      {/* Thumbnails strip */}
      {images.length > 1 && (
        <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-thin">
          {images.map((img, idx) => (
            <button
              key={idx}
              type="button"
              onClick={() => setSelectedIndex(idx)}
              className={`relative w-20 h-14 rounded-xl overflow-hidden shrink-0 border-2 transition-all cursor-pointer ${
                selectedIndex === idx
                  ? "border-primary ring-2 ring-primary/20 scale-102"
                  : "border-transparent opacity-70 hover:opacity-100"
              }`}
            >
              <Image src={img} alt={`Thumbnail ${idx + 1}`} fill className="object-cover" />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
