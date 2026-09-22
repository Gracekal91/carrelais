export type ArticleLanguage = "fr" | "en";

export type ArticleStatus = "DRAFT" | "PUBLISHED" | "UNPUBLISHED";

export type ArticleCategoryKey =
  | "buying-guide"
  | "selling-guide"
  | "car-prices"
  | "maintenance"
  | "reviews"
  | "importation"
  | "news"
  | "tips"
  | "drc-regulations"
  | "other";

export interface ArticleCategoryConfig {
  key: ArticleCategoryKey;
  labelFr: string;
  labelEn: string;
  badgeColor: string;
}

export const ARTICLE_CATEGORIES: Record<ArticleCategoryKey, ArticleCategoryConfig> = {
  "buying-guide": {
    key: "buying-guide",
    labelFr: "Guide d'achat",
    labelEn: "Buying Guide",
    badgeColor: "bg-blue-100 text-blue-800 dark:bg-blue-900/40 dark:text-blue-300",
  },
  "selling-guide": {
    key: "selling-guide",
    labelFr: "Guide de vente",
    labelEn: "Selling Guide",
    badgeColor: "bg-emerald-100 text-emerald-800 dark:bg-emerald-900/40 dark:text-emerald-300",
  },
  "car-prices": {
    key: "car-prices",
    labelFr: "Prix des véhicules",
    labelEn: "Car Prices",
    badgeColor: "bg-amber-100 text-amber-800 dark:bg-amber-900/40 dark:text-amber-300",
  },
  maintenance: {
    key: "maintenance",
    labelFr: "Entretien & Réparation",
    labelEn: "Maintenance",
    badgeColor: "bg-orange-100 text-orange-800 dark:bg-orange-900/40 dark:text-orange-300",
  },
  reviews: {
    key: "reviews",
    labelFr: "Essais & Avis",
    labelEn: "Reviews",
    badgeColor: "bg-purple-100 text-purple-800 dark:bg-purple-900/40 dark:text-purple-300",
  },
  importation: {
    key: "importation",
    labelFr: "Importation & Douanes",
    labelEn: "Importation",
    badgeColor: "bg-cyan-100 text-cyan-800 dark:bg-cyan-900/40 dark:text-cyan-300",
  },
  news: {
    key: "news",
    labelFr: "Actualités Automobiles",
    labelEn: "Automotive News",
    badgeColor: "bg-rose-100 text-rose-800 dark:bg-rose-900/40 dark:text-rose-300",
  },
  tips: {
    key: "tips",
    labelFr: "Conseils pratiques",
    labelEn: "Tips",
    badgeColor: "bg-indigo-100 text-indigo-800 dark:bg-indigo-900/40 dark:text-indigo-300",
  },
  "drc-regulations": {
    key: "drc-regulations",
    labelFr: "RDC & Réglementation",
    labelEn: "DRC Regulations",
    badgeColor: "bg-teal-100 text-teal-800 dark:bg-teal-900/40 dark:text-teal-300",
  },
  other: {
    key: "other",
    labelFr: "Autre",
    labelEn: "Other",
    badgeColor: "bg-zinc-100 text-zinc-800 dark:bg-zinc-800 dark:text-zinc-300",
  },
};

export interface ArticleAuthor {
  name: string;
  role?: string;
  avatar?: string;
}

export interface Article {
  id: string;
  title: string;
  slug: string;
  language: ArticleLanguage;
  category: ArticleCategoryKey;
  content: string;
  excerpt: string;
  featuredImage?: string;
  featuredImageCaption?: string;
  author: ArticleAuthor;
  status: ArticleStatus;
  publishedAt: string;
  updatedAt: string;
  createdAt: string;
  readingTime: number; // in minutes
  tags: string[];
  seoTitle?: string;
  seoDescription?: string;
  translationId?: string;
  previousSlugs: string[];
  views: number;
}
