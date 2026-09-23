import type { Metadata } from "next";
import { notFound, permanentRedirect, redirect } from "next/navigation";
import {
  getArticleBySlug,
  getRelatedArticles,
  getConnectedTranslation,
} from "@/lib/articles";
import ArticleDetailPage from "@/components/articles/ArticleDetailPage";
import { getBaseUrl } from "@/lib/url";

export const revalidate = 60;

export async function generateMetadata(props: {
  params: Promise<{ slug: string; locale?: string }>;
}): Promise<Metadata> {
  const params = await props.params;
  const baseUrl = getBaseUrl();
  const result = await getArticleBySlug(params.slug, "fr");

  if (!result.article) {
    return {
      title: "Article non trouvé - Car Relais",
    };
  }

  const article = result.article;
  const title = article.seoTitle || `${article.title} - Car Relais`;
  const description = article.seoDescription || article.excerpt;
  const canonicalUrl = `${baseUrl}/apprendre/${article.slug}`;

  // Find translation for hreflang
  const translated = await getConnectedTranslation(
    article.id,
    article.translationId
  );

  const languages: Record<string, string> = {
    fr: canonicalUrl,
  };
  if (translated) {
    languages.en = `${baseUrl}/en/learn/${translated.slug}`;
  }

  return {
    title,
    description,
    alternates: {
      canonical: canonicalUrl,
      languages,
    },
    openGraph: {
      title: article.title,
      description,
      url: canonicalUrl,
      siteName: "Car Relais",
      locale: "fr_FR",
      type: "article",
      publishedTime: article.publishedAt,
      modifiedTime: article.updatedAt,
      authors: [article.author?.name || "Car Relais"],
      images: article.featuredImage ? [{ url: article.featuredImage }] : [],
    },
    twitter: {
      card: "summary_large_image",
      title: article.title,
      description,
      images: article.featuredImage ? [article.featuredImage] : [],
    },
  };
}

export default async function FrenchArticleDetailPage(props: {
  params: Promise<{ slug: string; locale?: string }>;
}) {
  const params = await props.params;

  // If locale is english, redirect to english route
  if (params.locale === "en") {
    redirect(`/en/learn/${params.slug}`);
  }

  const result = await getArticleBySlug(params.slug, "fr");

  // If slug was changed, redirect 301 permanently to new canonical slug
  if (result.isRedirect && result.canonicalSlug) {
    permanentRedirect(`/apprendre/${result.canonicalSlug}`);
  }

  if (!result.article) {
    notFound();
  }

  const article = result.article;

  const [relatedArticles, translatedArticle] = await Promise.all([
    getRelatedArticles(article.id, article.category, "fr", 3),
    getConnectedTranslation(article.id, article.translationId),
  ]);

  const baseUrl = getBaseUrl();
  const canonicalUrl = `${baseUrl}/apprendre/${article.slug}`;

  // JSON-LD Structured Data for Article / BlogPosting
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "BlogPosting",
    headline: article.title,
    description: article.seoDescription || article.excerpt,
    image: article.featuredImage ? [article.featuredImage] : [],
    datePublished: article.publishedAt,
    dateModified: article.updatedAt,
    author: [
      {
        "@type": "Person",
        name: article.author?.name || "Car Relais",
      },
    ],
    publisher: {
      "@type": "Organization",
      name: "Car Relais",
      logo: {
        "@type": "ImageObject",
        url: `${baseUrl}/icon.png`,
      },
    },
    mainEntityOfPage: {
      "@type": "WebPage",
      "@id": canonicalUrl,
    },
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <ArticleDetailPage
        article={article}
        relatedArticles={relatedArticles}
        translatedArticle={translatedArticle}
        locale="fr"
      />
    </>
  );
}
