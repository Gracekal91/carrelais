import mongoose, { Schema, Model, Document } from "mongoose";
import { ArticleLanguage, ArticleStatus, ArticleCategoryKey } from "@/types/article";

export interface IArticleAuthor {
  name: string;
  role?: string;
  avatar?: string;
}

export interface IArticle extends Document {
  _id: any;
  title: string;
  slug: string;
  language: ArticleLanguage;
  category: ArticleCategoryKey;
  content: string;
  excerpt: string;
  featuredImage?: string;
  featuredImageCaption?: string;
  author: IArticleAuthor;
  status: ArticleStatus;
  publishedAt: Date;
  updatedAt: Date;
  createdAt: Date;
  readingTime: number;
  tags: string[];
  seoTitle?: string;
  seoDescription?: string;
  translationId?: mongoose.Types.ObjectId;
  previousSlugs: string[];
  views: number;
}

const AuthorSchema = new Schema<IArticleAuthor>(
  {
    name: { type: String, required: true, trim: true },
    role: { type: String, trim: true },
    avatar: { type: String, trim: true },
  },
  { _id: false }
);

const ArticleSchema = new Schema<IArticle>(
  {
    title: { type: String, required: true, trim: true },
    slug: { type: String, required: true, trim: true, lowercase: true },
    language: { type: String, enum: ["fr", "en"], required: true, default: "fr", index: true },
    category: {
      type: String,
      required: true,
      index: true,
      default: "buying-guide",
    },
    content: { type: String, required: true },
    excerpt: { type: String, default: "", trim: true },
    featuredImage: { type: String, trim: true },
    featuredImageCaption: { type: String, trim: true },
    author: {
      type: AuthorSchema,
      required: true,
      default: () => ({ name: "Car Relais", role: "Rédaction" }),
    },
    status: {
      type: String,
      enum: ["DRAFT", "PUBLISHED", "UNPUBLISHED"],
      default: "DRAFT",
      index: true,
    },
    publishedAt: { type: Date, default: () => new Date(), index: true },
    readingTime: { type: Number, default: 3 },
    tags: { type: [String], default: [], index: true },
    seoTitle: { type: String, trim: true },
    seoDescription: { type: String, trim: true },
    translationId: { type: Schema.Types.ObjectId, ref: "Article", default: null, index: true },
    previousSlugs: { type: [String], default: [] },
    views: { type: Number, default: 0 },
  },
  {
    timestamps: true,
  }
);

// Indexes for fast querying, unique slugs per language, and SEO lookups
ArticleSchema.index({ language: 1, slug: 1 }, { unique: true });
ArticleSchema.index({ language: 1, status: 1, publishedAt: -1 });
ArticleSchema.index({ language: 1, category: 1, status: 1, publishedAt: -1 });
ArticleSchema.index({ previousSlugs: 1 });

export const ArticleModel: Model<IArticle> =
  mongoose.models.Article || mongoose.model<IArticle>("Article", ArticleSchema);
