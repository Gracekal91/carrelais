"use server";

import { revalidatePath } from "next/cache";
import { connectToDatabase } from "@/lib/mongodb";
import { ArticleModel } from "@/lib/models/Article";
import { requireSuperAdminUser } from "@/lib/auth";
import { slugify, calculateReadingTime, extractExcerpt, sanitizeHtml } from "@/lib/content-sanitizer";
import { ArticleCategoryKey, ArticleLanguage, ArticleStatus } from "@/types/article";

export interface ArticleInputData {
  title: string;
  slug?: string;
  language: ArticleLanguage;
  category: ArticleCategoryKey;
  content: string;
  excerpt?: string;
  featuredImage?: string;
  featuredImageCaption?: string;
  authorName?: string;
  authorRole?: string;
  authorAvatar?: string;
  status?: ArticleStatus;
  publishedAt?: string;
  readingTime?: number;
  tags?: string[];
  seoTitle?: string;
  seoDescription?: string;
  translationId?: string;
}

/**
 * Super Admin Action: Create a new article
 */
export async function createArticleAction(data: ArticleInputData) {
  try {
    const user = await requireSuperAdminUser();
    await connectToDatabase();

    const title = data.title?.trim();
    if (!title) {
      return { success: false, error: "Le titre de l'article est requis." };
    }

    if (!data.content?.trim()) {
      return { success: false, error: "Le contenu de l'article est requis." };
    }

    const language: ArticleLanguage = data.language === "en" ? "en" : "fr";
    let finalSlug = data.slug ? slugify(data.slug) : slugify(title);
    if (!finalSlug) finalSlug = "article-" + Date.now();

    // Check slug uniqueness within language
    const existingWithSlug = await ArticleModel.findOne({ language, slug: finalSlug });
    if (existingWithSlug) {
      return {
        success: false,
        error: `Un article avec le slug "${finalSlug}" existe déjà en ${language === "fr" ? "Français" : "Anglais"}. Veuillez choisir un autre slug.`,
      };
    }

    const sanitizedContent = sanitizeHtml(data.content);
    const excerpt = data.excerpt?.trim() || extractExcerpt(sanitizedContent, 160);
    const readingTime = data.readingTime && data.readingTime > 0
      ? Number(data.readingTime)
      : calculateReadingTime(sanitizedContent);

    const authorName = data.authorName?.trim() || `${user.firstName} ${user.lastName}`.trim() || "Car Relais";
    const authorRole = data.authorRole?.trim() || "Rédaction";

    let publishedDate = new Date();
    if (data.publishedAt) {
      const parsed = new Date(data.publishedAt);
      if (!isNaN(parsed.getTime())) {
        publishedDate = parsed;
      }
    }

    const status: ArticleStatus = data.status || "DRAFT";

    const newDoc = await ArticleModel.create({
      title,
      slug: finalSlug,
      language,
      category: data.category || "buying-guide",
      content: sanitizedContent,
      excerpt,
      featuredImage: data.featuredImage?.trim() || undefined,
      featuredImageCaption: data.featuredImageCaption?.trim() || undefined,
      author: {
        name: authorName,
        role: authorRole,
        avatar: data.authorAvatar?.trim() || undefined,
      },
      status,
      publishedAt: publishedDate,
      readingTime,
      tags: Array.isArray(data.tags) ? data.tags.map((t) => t.trim()).filter(Boolean) : [],
      seoTitle: data.seoTitle?.trim() || undefined,
      seoDescription: data.seoDescription?.trim() || undefined,
      translationId: data.translationId ? data.translationId : undefined,
      previousSlugs: [],
      views: 0,
    });

    // If connected translation was specified, sync reverse translation link bidirectionally
    if (data.translationId) {
      try {
        await ArticleModel.findByIdAndUpdate(data.translationId, {
          translationId: newDoc._id,
        });
      } catch (linkErr) {
        console.error("Error linking reverse translation:", linkErr);
      }
    }

    revalidatePath("/admin/articles");
    revalidatePath("/apprendre");
    revalidatePath("/fr/apprendre");
    revalidatePath("/en/learn");

    return {
      success: true,
      articleId: newDoc._id.toString(),
      slug: newDoc.slug,
    };
  } catch (error: any) {
    console.error("[createArticleAction Error]", error);
    return { success: false, error: error.message || "Erreur lors de la création de l'article." };
  }
}

/**
 * Super Admin Action: Update an existing article
 */
export async function updateArticleAction(id: string, data: ArticleInputData) {
  try {
    await requireSuperAdminUser();
    await connectToDatabase();

    const article = await ArticleModel.findById(id);
    if (!article) {
      return { success: false, error: "Article introuvable." };
    }

    const title = data.title?.trim();
    if (!title) {
      return { success: false, error: "Le titre de l'article est requis." };
    }

    if (!data.content?.trim()) {
      return { success: false, error: "Le contenu de l'article est requis." };
    }

    const language: ArticleLanguage = data.language === "en" ? "en" : "fr";
    let newSlug = data.slug ? slugify(data.slug) : slugify(title);
    if (!newSlug) newSlug = article.slug;

    // Check slug uniqueness if changed
    if (newSlug !== article.slug || language !== article.language) {
      const duplicate = await ArticleModel.findOne({
        _id: { $ne: article._id },
        language,
        slug: newSlug,
      });

      if (duplicate) {
        return {
          success: false,
          error: `Un article avec le slug "${newSlug}" existe déjà en ${language === "fr" ? "Français" : "Anglais"}.`,
        };
      }

      // Track previous slug for automatic 301 redirection
      if (newSlug !== article.slug) {
        const prev = article.previousSlugs || [];
        if (!prev.includes(article.slug)) {
          article.previousSlugs = [...prev, article.slug];
        }
        article.slug = newSlug;
      }
    }

    const sanitizedContent = sanitizeHtml(data.content);
    const excerpt = data.excerpt?.trim() || extractExcerpt(sanitizedContent, 160);
    const readingTime = data.readingTime && data.readingTime > 0
      ? Number(data.readingTime)
      : calculateReadingTime(sanitizedContent);

    article.title = title;
    article.language = language;
    article.category = data.category || article.category;
    article.content = sanitizedContent;
    article.excerpt = excerpt;
    article.featuredImage = data.featuredImage?.trim() || undefined;
    article.featuredImageCaption = data.featuredImageCaption?.trim() || undefined;
    article.readingTime = readingTime;
    article.tags = Array.isArray(data.tags) ? data.tags.map((t) => t.trim()).filter(Boolean) : [];
    article.seoTitle = data.seoTitle?.trim() || undefined;
    article.seoDescription = data.seoDescription?.trim() || undefined;

    if (data.authorName) {
      article.author = {
        name: data.authorName.trim(),
        role: data.authorRole?.trim() || article.author?.role || "Rédaction",
        avatar: data.authorAvatar?.trim() || article.author?.avatar,
      };
    }

    if (data.status) {
      article.status = data.status;
    }

    if (data.publishedAt) {
      const parsed = new Date(data.publishedAt);
      if (!isNaN(parsed.getTime())) {
        article.publishedAt = parsed;
      }
    }

    // Translation connection management
    const oldTranslationId = article.translationId ? article.translationId.toString() : null;
    const newTranslationId = data.translationId ? data.translationId.trim() : null;

    if (oldTranslationId !== newTranslationId) {
      // Unlink old translation if any
      if (oldTranslationId) {
        await ArticleModel.findByIdAndUpdate(oldTranslationId, { translationId: null });
      }
      // Link new translation
      if (newTranslationId) {
        article.translationId = newTranslationId as any;
        await ArticleModel.findByIdAndUpdate(newTranslationId, { translationId: article._id });
      } else {
        article.translationId = undefined as any;
      }
    }

    await article.save();

    revalidatePath("/admin/articles");
    revalidatePath(`/admin/articles/${id}/edit`);
    revalidatePath("/apprendre");
    revalidatePath("/fr/apprendre");
    revalidatePath("/en/learn");
    revalidatePath(`/fr/apprendre/${article.slug}`);
    revalidatePath(`/apprendre/${article.slug}`);
    revalidatePath(`/en/learn/${article.slug}`);

    return {
      success: true,
      articleId: article._id.toString(),
      slug: article.slug,
    };
  } catch (error: any) {
    console.error("[updateArticleAction Error]", error);
    return { success: false, error: error.message || "Erreur lors de la mise à jour de l'article." };
  }
}

/**
 * Super Admin Action: Delete an article
 */
export async function deleteArticleAction(id: string) {
  try {
    await requireSuperAdminUser();
    await connectToDatabase();

    const article = await ArticleModel.findById(id);
    if (!article) {
      return { success: false, error: "Article introuvable." };
    }

    // Unlink any translation referring to this article
    if (article.translationId) {
      await ArticleModel.findByIdAndUpdate(article.translationId, { translationId: null });
    }
    await ArticleModel.updateMany({ translationId: article._id }, { translationId: null });

    await ArticleModel.findByIdAndDelete(id);

    revalidatePath("/admin/articles");
    revalidatePath("/apprendre");
    revalidatePath("/fr/apprendre");
    revalidatePath("/en/learn");

    return { success: true };
  } catch (error: any) {
    console.error("[deleteArticleAction Error]", error);
    return { success: false, error: error.message || "Erreur lors de la suppression de l'article." };
  }
}

/**
 * Super Admin Action: Quick status toggle (DRAFT <-> PUBLISHED <-> UNPUBLISHED)
 */
export async function setArticleStatusAction(id: string, status: ArticleStatus) {
  try {
    await requireSuperAdminUser();
    await connectToDatabase();

    const update: Record<string, any> = { status };
    if (status === "PUBLISHED") {
      update.publishedAt = new Date();
    }

    const article = await ArticleModel.findByIdAndUpdate(id, update, { new: true });
    if (!article) {
      return { success: false, error: "Article introuvable." };
    }

    revalidatePath("/admin/articles");
    revalidatePath("/apprendre");
    revalidatePath("/fr/apprendre");
    revalidatePath("/en/learn");
    revalidatePath(`/fr/apprendre/${article.slug}`);
    revalidatePath(`/apprendre/${article.slug}`);
    revalidatePath(`/en/learn/${article.slug}`);

    return { success: true, status: article.status };
  } catch (error: any) {
    console.error("[setArticleStatusAction Error]", error);
    return { success: false, error: error.message || "Erreur lors de la mise à jour du statut." };
  }
}
