import React from "react";
import Link from "next/link";
import Image from "next/image";
import {
  Clock,
  Calendar,
  User,
  ArrowLeft,
  Globe,
  Tag,
  Share2,
  Sparkles,
  ChevronRight,
  ShieldAlert,
} from "lucide-react";
import { Article, ARTICLE_CATEGORIES } from "@/types/article";
import ArticleCard from "./ArticleCard";
import ArticleShareButtons from "./ArticleShareButtons";

interface ArticleDetailPageProps {
  article: Article;
  relatedArticles?: Article[];
  translatedArticle?: Article | null;
  locale: string;
  isPreview?: boolean;
}

export default function ArticleDetailPage({
  article,
  relatedArticles = [],
  translatedArticle = null,
  locale,
  isPreview = false,
}: ArticleDetailPageProps) {
  const isEn = locale === "en" || article.language === "en";
  const categoryConfig = ARTICLE_CATEGORIES[article.category] || ARTICLE_CATEGORIES.other;

  const learnBasePath = isEn ? "/en/learn" : "/fr/apprendre";
  const learnLabel = isEn ? "Learn" : "Apprendre";
  const homeLabel = isEn ? "Home" : "Accueil";

  const formattedPublishedDate = new Date(article.publishedAt || article.createdAt).toLocaleDateString(
    isEn ? "en-US" : "fr-FR",
    {
      day: "numeric",
      month: "long",
      year: "numeric",
    }
  );

  const formattedUpdatedDate = article.updatedAt
    ? new Date(article.updatedAt).toLocaleDateString(isEn ? "en-US" : "fr-FR", {
        day: "numeric",
        month: "long",
        year: "numeric",
      })
    : null;

  const isUpdatedDifferent =
    formattedUpdatedDate &&
    new Date(article.updatedAt).getTime() - new Date(article.publishedAt).getTime() >
      1000 * 60 * 60 * 24; // > 1 day difference

  const currentUrl =
    typeof window !== "undefined"
      ? window.location.href
      : `https://carrelais.cd${learnBasePath}/${article.slug}`;

  return (
    <article className="min-h-screen bg-zinc-50/60 dark:bg-zinc-950 pb-20">
      {/* Admin Preview Banner */}
      {isPreview && (
        <div className="bg-amber-500 text-black px-4 py-2 text-center text-xs font-bold sticky top-0 z-50 shadow-md">
          <span>⚠️ Mode Aperçu Super Administrateur (Cet article est en brouillon ou en prévisualisation)</span>
        </div>
      )}

      {/* Breadcrumbs */}
      <div className="border-b border-zinc-200 dark:border-zinc-800 bg-white/70 dark:bg-zinc-900/70 backdrop-blur-md">
        <div className="container mx-auto px-4 max-w-4xl py-3 text-xs text-zinc-500 flex items-center gap-1.5 flex-wrap">
          <Link href="/" className="hover:text-primary transition-colors">
            {homeLabel}
          </Link>
          <ChevronRight className="w-3.5 h-3.5 text-zinc-400" />
          <Link href={learnBasePath} className="hover:text-primary transition-colors">
            {learnLabel}
          </Link>
          <ChevronRight className="w-3.5 h-3.5 text-zinc-400" />
          <span className="text-zinc-900 dark:text-zinc-100 font-medium truncate max-w-xs sm:max-w-md">
            {article.title}
          </span>
        </div>
      </div>

      {/* Main Container */}
      <div className="container mx-auto px-4 max-w-4xl mt-8">
        {/* Back button */}
        <div className="mb-6">
          <Link
            href={learnBasePath}
            className="inline-flex items-center gap-2 text-xs font-semibold text-zinc-600 dark:text-zinc-400 hover:text-primary transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>{isEn ? "Back to Learn" : "Retour aux articles"}</span>
          </Link>
        </div>

        {/* Translation Banner (if linked) */}
        {translatedArticle && (
          <div className="mb-6 p-3.5 rounded-2xl bg-primary/10 border border-primary/20 text-xs flex items-center justify-between gap-3 text-primary">
            <div className="flex items-center gap-2">
              <Globe className="w-4 h-4 shrink-0" />
              <span>
                {isEn ? (
                  <>
                    This article is also available in French :{" "}
                    <strong className="underline">{translatedArticle.title}</strong>
                  </>
                ) : (
                  <>
                    Cet article est également disponible en Anglais :{" "}
                    <strong className="underline">{translatedArticle.title}</strong>
                  </>
                )}
              </span>
            </div>
            <Link
              href={
                isEn
                  ? `/fr/apprendre/${translatedArticle.slug}`
                  : `/en/learn/${translatedArticle.slug}`
              }
              className="px-3 py-1 rounded-xl bg-primary text-white font-bold shrink-0 hover:bg-primary/90 transition-colors"
            >
              {isEn ? "Lire en Français 🇫🇷" : "Read in English 🇬🇧"}
            </Link>
          </div>
        )}

        {/* Article Header */}
        <header className="space-y-4 mb-8">
          {/* Category Badge */}
          <div>
            <span
              className={`inline-block px-3.5 py-1 rounded-full text-xs font-bold ${categoryConfig.badgeColor}`}
            >
              {isEn ? categoryConfig.labelEn : categoryConfig.labelFr}
            </span>
          </div>

          {/* Title */}
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black text-zinc-900 dark:text-zinc-50 tracking-tight leading-tight">
            {article.title}
          </h1>

          {/* Excerpt / Lead */}
          {article.excerpt && (
            <p className="text-base sm:text-lg text-zinc-600 dark:text-zinc-300 leading-relaxed font-normal">
              {article.excerpt}
            </p>
          )}

          {/* Metadata bar: Author, Date, Reading time */}
          <div className="pt-4 border-t border-zinc-200 dark:border-zinc-800 flex flex-wrap items-center justify-between gap-4 text-xs text-zinc-500">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-primary/15 text-primary flex items-center justify-center font-bold text-sm">
                {article.author?.name?.charAt(0) || "C"}
              </div>
              <div>
                <div className="font-bold text-zinc-900 dark:text-zinc-100">
                  {article.author?.name || "Car Relais"}
                </div>
                <div className="text-[11px] text-zinc-400">
                  {article.author?.role || (isEn ? "Editorial Team" : "Rédaction")}
                </div>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <div className="flex items-center gap-1.5">
                <Calendar className="w-3.5 h-3.5 text-zinc-400" />
                <span>{formattedPublishedDate}</span>
              </div>
              <span>•</span>
              <div className="flex items-center gap-1.5">
                <Clock className="w-3.5 h-3.5 text-zinc-400" />
                <span>
                  {article.readingTime || 3}{" "}
                  {isEn ? "min read" : "min de lecture"}
                </span>
              </div>
              {isUpdatedDifferent && (
                <>
                  <span>•</span>
                  <span className="text-[11px] text-zinc-400 italic">
                    {isEn ? "Updated" : "Mis à jour le"} {formattedUpdatedDate}
                  </span>
                </>
              )}
            </div>
          </div>
        </header>

        {/* Featured Image with Caption */}
        {article.featuredImage && (
          <figure className="mb-10 rounded-3xl overflow-hidden border border-zinc-200 dark:border-zinc-800 shadow-sm bg-zinc-100 dark:bg-zinc-800">
            <div className="relative aspect-[16/9] w-full">
              <Image
                src={article.featuredImage}
                alt={article.title}
                fill
                priority
                className="object-cover"
                sizes="(max-width: 1024px) 100vw, 896px"
              />
            </div>
            {article.featuredImageCaption && (
              <figcaption className="p-3 text-center text-xs text-zinc-500 bg-white/50 dark:bg-zinc-900/50 border-t border-zinc-100 dark:border-zinc-800/80">
                {article.featuredImageCaption}
              </figcaption>
            )}
          </figure>
        )}

        {/* Main Article Body (Prose Styled Rich Content) */}
        <div className="bg-white dark:bg-zinc-900 p-6 sm:p-10 rounded-3xl border border-zinc-200 dark:border-zinc-800 shadow-xs mb-10">
          <div
            className="prose prose-zinc dark:prose-invert max-w-none text-zinc-800 dark:text-zinc-200 leading-relaxed text-sm sm:text-base selection:bg-primary/20
              prose-headings:font-black prose-headings:tracking-tight prose-headings:text-zinc-950 dark:prose-headings:text-zinc-50
              prose-h2:text-2xl prose-h2:sm:text-3xl prose-h2:mt-10 prose-h2:mb-4
              prose-h3:text-xl prose-h3:mt-8 prose-h3:mb-3
              prose-p:mb-5 prose-p:leading-relaxed
              prose-a:text-primary prose-a:font-semibold prose-a:underline hover:prose-a:text-primary/80
              prose-blockquote:border-l-4 prose-blockquote:border-primary prose-blockquote:bg-zinc-50 dark:prose-blockquote:bg-zinc-800/50 prose-blockquote:py-2 prose-blockquote:px-5 prose-blockquote:rounded-r-xl prose-blockquote:italic
              prose-ul:my-5 prose-ul:list-disc prose-ul:pl-6
              prose-ol:my-5 prose-ol:list-decimal prose-ol:pl-6
              prose-li:my-1.5
              prose-img:rounded-2xl prose-img:shadow-sm prose-img:border prose-img:border-zinc-200 dark:prose-img:border-zinc-800
              prose-hr:my-8 prose-hr:border-zinc-200 dark:prose-hr:border-zinc-800
            "
            dangerouslySetInnerHTML={{ __html: article.content }}
          />

          {/* Tags */}
          {article.tags && article.tags.length > 0 && (
            <div className="mt-10 pt-6 border-t border-zinc-100 dark:border-zinc-800 flex flex-wrap items-center gap-2">
              <span className="text-xs font-bold text-zinc-500 flex items-center gap-1.5 mr-1">
                <Tag className="w-3.5 h-3.5" />
                <span>Tags :</span>
              </span>
              {article.tags.map((tag, idx) => (
                <span
                  key={idx}
                  className="px-2.5 py-1 rounded-lg bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 text-xs font-medium"
                >
                  #{tag}
                </span>
              ))}
            </div>
          )}

          {/* Social Share bar */}
          <div className="mt-8 pt-6 border-t border-zinc-100 dark:border-zinc-800 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <ArticleShareButtons
              title={article.title}
              url={currentUrl}
              locale={locale}
            />

            <Link
              href={learnBasePath}
              className="inline-flex items-center gap-1.5 text-xs font-bold text-primary hover:underline"
            >
              <span>{isEn ? "Explore more guides" : "Explorer d'autres guides"}</span>
              <ArrowLeft className="w-3.5 h-3.5 rotate-180" />
            </Link>
          </div>
        </div>

        {/* Author Bio Card */}
        <div className="bg-white dark:bg-zinc-900 p-6 rounded-3xl border border-zinc-200 dark:border-zinc-800 shadow-xs flex items-center gap-4 mb-16">
          <div className="w-14 h-14 rounded-2xl bg-primary text-white flex items-center justify-center font-black text-xl shrink-0 shadow-md shadow-primary/20">
            {article.author?.name?.charAt(0) || "C"}
          </div>
          <div className="space-y-1">
            <h4 className="font-bold text-base text-zinc-900 dark:text-zinc-100">
              {article.author?.name || "Car Relais"}
            </h4>
            <p className="text-xs text-zinc-500 leading-relaxed">
              {isEn
                ? "Car Relais is the premier automotive marketplace in the Democratic Republic of Congo. Our editorial team provides verified insights, pricing analysis, and guidance for vehicle buyers and sellers."
                : "Car Relais est la première plateforme automobile en République Démocratique du Congo. Notre rédaction vous apporte des conseils vérifiés, analyses de prix et guides pratiques pour acheter et vendre en toute sécurité."}
            </p>
          </div>
        </div>

        {/* Related Articles Section */}
        {relatedArticles.length > 0 && (
          <section className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-xl font-bold text-zinc-900 dark:text-zinc-100">
                  {isEn ? "Related articles" : "Articles similaires"}
                </h3>
                <p className="text-xs text-zinc-500">
                  {isEn
                    ? "More guides and advice in this category"
                    : "Poursuivez votre lecture avec ces recommandations"}
                </p>
              </div>

              <Link
                href={`${learnBasePath}?category=${article.category}`}
                className="text-xs font-bold text-primary hover:underline"
              >
                {isEn ? "View all" : "Voir tout"}
              </Link>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {relatedArticles.map((rel) => (
                <ArticleCard key={rel.id} article={rel} locale={locale} />
              ))}
            </div>
          </section>
        )}
      </div>
    </article>
  );
}
