import { connectToDatabase } from "@/lib/mongodb";
import { ArticleModel, IArticle } from "@/lib/models/Article";
import { Article, ArticleCategoryKey, ArticleLanguage } from "@/types/article";

/**
 * Format a MongoDB Article document into a plain JSON Article object
 */
export function formatArticle(doc: any): Article {
  if (!doc) return doc;
  const id = doc._id ? doc._id.toString() : (doc.id || "");
  const plain = JSON.parse(JSON.stringify(doc));
  delete plain._id;
  delete plain.__v;

  return {
    ...plain,
    id,
    translationId: plain.translationId ? plain.translationId.toString() : undefined,
    publishedAt: plain.publishedAt ? new Date(plain.publishedAt).toISOString() : new Date().toISOString(),
    updatedAt: plain.updatedAt ? new Date(plain.updatedAt).toISOString() : new Date().toISOString(),
    createdAt: plain.createdAt ? new Date(plain.createdAt).toISOString() : new Date().toISOString(),
    tags: Array.isArray(plain.tags) ? plain.tags : [],
    previousSlugs: Array.isArray(plain.previousSlugs) ? plain.previousSlugs : [],
    views: typeof plain.views === "number" ? plain.views : 0,
    readingTime: typeof plain.readingTime === "number" ? plain.readingTime : 3,
  } as Article;
}

export interface ArticleSearchParams {
  locale?: string;
  category?: string;
  q?: string;
  page?: number;
  pageSize?: number;
}

export interface PaginatedArticlesResult {
  articles: Article[];
  totalCount: number;
  currentPage: number;
  totalPages: number;
  pageSize: number;
}

/**
 * Fetch published articles for public listing with category filtering, search, and pagination
 */
export async function getPublishedArticles(params: ArticleSearchParams = {}): Promise<PaginatedArticlesResult> {
  try {
    await connectToDatabase();

    const locale = params.locale === "en" ? "en" : "fr";
    const page = Math.max(1, Number(params.page) || 1);
    const pageSize = Math.max(1, Math.min(50, Number(params.pageSize) || 9));

    const filter: Record<string, any> = {
      language: locale,
      status: "PUBLISHED",
      publishedAt: { $lte: new Date() },
    };

    if (params.category && params.category !== "all") {
      filter.category = params.category;
    }

    if (params.q && params.q.trim()) {
      const qRegex = new RegExp(params.q.trim(), "i");
      filter.$or = [
        { title: qRegex },
        { excerpt: qRegex },
        { content: qRegex },
        { tags: qRegex },
      ];
    }

    const [totalCount, docs] = await Promise.all([
      ArticleModel.countDocuments(filter),
      ArticleModel.find(filter)
        .sort({ publishedAt: -1 })
        .skip((page - 1) * pageSize)
        .limit(pageSize)
        .lean(),
    ]);

    const totalPages = Math.max(1, Math.ceil(totalCount / pageSize));

    return {
      articles: docs.map(formatArticle),
      totalCount,
      currentPage: page,
      totalPages,
      pageSize,
    };
  } catch (error) {
    console.error("[getPublishedArticles Error]", error);
    return {
      articles: [],
      totalCount: 0,
      currentPage: 1,
      totalPages: 1,
      pageSize: 9,
    };
  }
}

export interface GetArticleResult {
  article: Article | null;
  isRedirect?: boolean;
  canonicalSlug?: string;
}

/**
 * Fetch an article by slug (supports matching previousSlugs for 301 redirects)
 */
export async function getArticleBySlug(
  slug: string,
  locale?: string,
  includeUnpublished = false
): Promise<GetArticleResult> {
  try {
    await connectToDatabase();
    const language = locale === "en" ? "en" : "fr";

    const filter: Record<string, any> = {
      language,
      $or: [{ slug: slug.toLowerCase() }, { previousSlugs: slug.toLowerCase() }],
    };

    if (!includeUnpublished) {
      filter.status = "PUBLISHED";
      filter.publishedAt = { $lte: new Date() };
    }

    const doc = await ArticleModel.findOne(filter).lean();
    if (!doc) {
      return { article: null };
    }

    // Check if the requested slug is an older slug
    const isPreviousSlug = doc.slug !== slug.toLowerCase();

    return {
      article: formatArticle(doc),
      isRedirect: isPreviousSlug,
      canonicalSlug: doc.slug,
    };
  } catch (error) {
    console.error("[getArticleBySlug Error]", error);
    return { article: null };
  }
}

/**
 * Fetch an article by ID
 */
export async function getArticleById(id: string): Promise<Article | null> {
  try {
    await connectToDatabase();
    const doc = await ArticleModel.findById(id).lean();
    if (!doc) return null;
    return formatArticle(doc);
  } catch (error) {
    console.error("[getArticleById Error]", error);
    return null;
  }
}

/**
 * Fetch related articles for the bottom of an article detail page
 */
export async function getRelatedArticles(
  currentArticleId: string,
  category: ArticleCategoryKey,
  locale: string,
  limit = 3
): Promise<Article[]> {
  try {
    await connectToDatabase();
    const language = locale === "en" ? "en" : "fr";

    // First try: same category, excluding current article
    const filter: Record<string, any> = {
      language,
      status: "PUBLISHED",
      publishedAt: { $lte: new Date() },
    };

    if (currentArticleId) {
      filter._id = { $ne: currentArticleId };
    }

    let docs = await ArticleModel.find({ ...filter, category })
      .sort({ publishedAt: -1 })
      .limit(limit)
      .lean();

    // If fewer than requested limit, fill with latest articles from any category
    if (docs.length < limit) {
      const existingIds = docs.map((d: any) => d._id);
      if (currentArticleId) existingIds.push(currentArticleId as any);

      const fillDocs = await ArticleModel.find({
        language,
        status: "PUBLISHED",
        publishedAt: { $lte: new Date() },
        _id: { $nin: existingIds },
      })
        .sort({ publishedAt: -1 })
        .limit(limit - docs.length)
        .lean();

      docs = [...docs, ...fillDocs];
    }

    return docs.map(formatArticle);
  } catch (error) {
    console.error("[getRelatedArticles Error]", error);
    return [];
  }
}

/**
 * Find the connected translated article (either via translationId or reverse link)
 */
export async function getConnectedTranslation(
  articleId?: string,
  translationId?: string
): Promise<Article | null> {
  try {
    if (!articleId && !translationId) return null;
    await connectToDatabase();

    let doc: any = null;
    if (translationId) {
      doc = await ArticleModel.findById(translationId).lean();
    }
    if (!doc && articleId) {
      doc = await ArticleModel.findOne({ translationId: articleId }).lean();
    }

    if (!doc) return null;
    return formatArticle(doc);
  } catch (error) {
    console.error("[getConnectedTranslation Error]", error);
    return null;
  }
}

/**
 * Return article counts per category for the filter tabs
 */
export async function getCategoryArticleCounts(locale: string): Promise<Record<string, number>> {
  try {
    await connectToDatabase();
    const language = locale === "en" ? "en" : "fr";

    const counts = await ArticleModel.aggregate([
      {
        $match: {
          language,
          status: "PUBLISHED",
          publishedAt: { $lte: new Date() },
        },
      },
      {
        $group: {
          _id: "$category",
          count: { $sum: 1 },
        },
      },
    ]);

    const result: Record<string, number> = {};
    for (const item of counts) {
      if (item._id) {
        result[item._id] = item.count;
      }
    }
    return result;
  } catch (error) {
    console.error("[getCategoryArticleCounts Error]", error);
    return {};
  }
}

export interface AdminArticlesQuery {
  page?: number;
  pageSize?: number;
  search?: string;
  status?: string;
  language?: string;
  category?: string;
}

/**
 * Fetch articles for Super Admin CMS management table
 */
export async function getAdminArticles(query: AdminArticlesQuery = {}) {
  try {
    await connectToDatabase();

    const page = Math.max(1, Number(query.page) || 1);
    const pageSize = Math.max(1, Math.min(100, Number(query.pageSize) || 10));

    const filter: Record<string, any> = {};

    if (query.status && query.status !== "ALL") {
      filter.status = query.status;
    }

    if (query.language && query.language !== "ALL") {
      filter.language = query.language;
    }

    if (query.category && query.category !== "ALL") {
      filter.category = query.category;
    }

    if (query.search && query.search.trim()) {
      const qRegex = new RegExp(query.search.trim(), "i");
      filter.$or = [
        { title: qRegex },
        { slug: qRegex },
        { excerpt: qRegex },
        { tags: qRegex },
        { "author.name": qRegex },
      ];
    }

    const [totalCount, docs] = await Promise.all([
      ArticleModel.countDocuments(filter),
      ArticleModel.find(filter)
        .sort({ updatedAt: -1, createdAt: -1 })
        .skip((page - 1) * pageSize)
        .limit(pageSize)
        .lean(),
    ]);

    const totalPages = Math.max(1, Math.ceil(totalCount / pageSize));

    return {
      articles: docs.map(formatArticle),
      totalCount,
      currentPage: page,
      totalPages,
      pageSize,
    };
  } catch (error) {
    console.error("[getAdminArticles Error]", error);
    return {
      articles: [],
      totalCount: 0,
      currentPage: 1,
      totalPages: 1,
      pageSize: 10,
    };
  }
}

/**
 * Fetch candidate articles of the opposite language for translation linking
 */
export async function getCandidateTranslations(
  targetLanguage: ArticleLanguage,
  currentArticleId?: string
): Promise<{ id: string; title: string; slug: string }[]> {
  try {
    await connectToDatabase();
    const filter: Record<string, any> = { language: targetLanguage };
    if (currentArticleId) {
      filter._id = { $ne: currentArticleId };
    }

    const docs = await ArticleModel.find(filter)
      .select("_id title slug")
      .sort({ createdAt: -1 })
      .limit(100)
      .lean();

    return docs.map((d: any) => ({
      id: d._id.toString(),
      title: d.title,
      slug: d.slug,
    }));
  } catch (error) {
    console.error("[getCandidateTranslations Error]", error);
    return [];
  }
}
