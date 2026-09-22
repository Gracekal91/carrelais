import type { Metadata } from "next";
import { notFound, permanentRedirect, redirect } from "next/navigation";
import {
  getArticleBySlug,
  getRelatedArticles,
  getConnectedTranslation,
} from "@/lib/articles";
import ArticleDetailPage from "@/components/articles/ArticleDetailPage";

export const revalidate = 60;

export async function generateMetadata(props: {
  params: Promise<{ slug: string; locale?: string }>;
}): Promise<Metadata> {
  const params = await props.params;
  const result = await getArticleBySlug(params.slug, "en");

  if (!result.article) {
    return {
      title: "Article Not Found - Car Relais",
    };
  }

  const article = result.article;
  const title = article.seoTitle || `${article.title} - Car Relais`;
  const description = article.seoDescription || article.excerpt;
  const canonicalUrl = `https://carrelais.cd/en/learn/${article.slug}`;

  // Find translation for hreflang
  const translated = await getConnectedTranslation(
    article.id,
    article.translationId
  );

  const languages: Record<string, string> = {
    en: canonicalUrl,
  };
  if (translated) {
    languages.fr = `https://carrelais.cd/fr/apprendre/${translated.slug}`;
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
      locale: "en_US",
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

export default async function EnglishArticleDetailPage(props: {
  params: Promise<{ slug: string; locale?: string }>;
}) {
  const params = await props.params;

  // If locale is french, redirect to french route
  if (params.locale === "fr") {
    redirect(`/fr/apprendre/${params.slug}`);
  }

  const result = await getArticleBySlug(params.slug, "en");

  // If slug was changed, redirect 301 permanently to new canonical slug
  if (result.isRedirect && result.canonicalSlug) {
    permanentRedirect(`/en/learn/${result.canonicalSlug}`);
  }

  if (!result.article) {
    notFound();
  }

  const article = result.article;

  const [relatedArticles, translatedArticle] = await Promise.all([
    getRelatedArticles(article.id, article.category, "en", 3),
    getConnectedTranslation(article.id, article.translationId),
  ]);

  const canonicalUrl = `https://carrelais.cd/en/learn/${article.slug}`;

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
        url: "https://carrelais.cd/icon.png",
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
        locale="en"
      />
    </>
  );
}
