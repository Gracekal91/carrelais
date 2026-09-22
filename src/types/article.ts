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
    badgeColor: "bg-blue-600 text-white",
  },
  "selling-guide": {
    key: "selling-guide",
    labelFr: "Guide de vente",
    labelEn: "Selling Guide",
    badgeColor: "bg-emerald-600 text-white",
  },
  "car-prices": {
    key: "car-prices",
    labelFr: "Prix des véhicules",
    labelEn: "Car Prices",
    badgeColor: "bg-amber-600 text-white",
  },
  maintenance: {
    key: "maintenance",
    labelFr: "Entretien & Réparation",
    labelEn: "Maintenance",
    badgeColor: "bg-orange-600 text-white",
  },
  reviews: {
    key: "reviews",
    labelFr: "Essais & Avis",
    labelEn: "Reviews",
    badgeColor: "bg-purple-600 text-white",
  },
  importation: {
    key: "importation",
    labelFr: "Importation & Douanes",
    labelEn: "Importation",
    badgeColor: "bg-cyan-600 text-white",
  },
  news: {
    key: "news",
    labelFr: "Actualités Automobiles",
    labelEn: "Automotive News",
    badgeColor: "bg-rose-600 text-white",
  },
  tips: {
    key: "tips",
    labelFr: "Conseils pratiques",
    labelEn: "Tips",
    badgeColor: "bg-indigo-600 text-white",
  },
  "drc-regulations": {
    key: "drc-regulations",
    labelFr: "RDC & Réglementation",
    labelEn: "DRC Regulations",
    badgeColor: "bg-teal-600 text-white",
  },
  other: {
    key: "other",
    labelFr: "Autre",
    labelEn: "Other",
    badgeColor: "bg-zinc-800 text-white",
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
