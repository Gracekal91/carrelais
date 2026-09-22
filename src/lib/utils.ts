import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatPrice(amount: number, currency: string = "USD") {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency,
    maximumFractionDigits: 0,
  }).format(amount);
}

export function formatListingDate(
  dateInput?: string | Date,
  locale: string = "fr",
  withoutPrefix: boolean = false
): string {
  if (!dateInput) return "";
  const date = typeof dateInput === "string" ? new Date(dateInput) : dateInput;
  if (isNaN(date.getTime())) return "";

  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffSec = Math.floor(diffMs / 1000);
  const diffMin = Math.floor(diffSec / 60);
  const diffHours = Math.floor(diffMin / 60);
  const diffDays = Math.floor(diffHours / 24);

  const isFr = locale.startsWith("fr");

  if (diffHours < 1) {
    if (withoutPrefix) {
      return isFr ? "Il y a quelques instants" : "Just now";
    }
    return isFr ? "Publié il y a quelques instants" : "Listed just now";
  }
  if (diffHours < 24) {
    if (withoutPrefix) {
      return isFr ? `Il y a ${diffHours}h` : `${diffHours}h ago`;
    }
    return isFr
      ? `Publié il y a ${diffHours}h`
      : `Listed ${diffHours}h ago`;
  }
  if (diffDays === 1) {
    if (withoutPrefix) {
      return isFr ? "Hier" : "Yesterday";
    }
    return isFr ? "Publié hier" : "Listed yesterday";
  }
  if (diffDays < 30) {
    if (withoutPrefix) {
      return isFr ? `Il y a ${diffDays} jours` : `${diffDays} days ago`;
    }
    return isFr
      ? `Publié il y a ${diffDays} jours`
      : `Listed ${diffDays} days ago`;
  }

  const formattedDate = new Intl.DateTimeFormat(isFr ? "fr-FR" : "en-US", {
    day: "numeric",
    month: "short",
    year: "numeric",
  }).format(date);

  if (withoutPrefix) {
    return formattedDate;
  }
  return isFr ? `Publié le ${formattedDate}` : `Listed on ${formattedDate}`;
}
