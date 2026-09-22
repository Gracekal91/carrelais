import React from "react";
import Link from "next/link";
import Image from "next/image";
import { Clock, ArrowRight, FileText } from "lucide-react";
import { Article, ARTICLE_CATEGORIES } from "@/types/article";

interface ArticleCardProps {
  article: Article;
  locale: string;
  priority?: boolean;
  loading?: "eager" | "lazy";
}

export default function ArticleCard({
  article,
  locale,
  priority = false,
  loading,
}: ArticleCardProps) {
  const categoryConfig = ARTICLE_CATEGORIES[article.category] || ARTICLE_CATEGORIES.other;
  const isEn = locale === "en" || article.language === "en";

  const href = isEn
    ? `/en/learn/${article.slug}`
    : `/fr/apprendre/${article.slug}`;

  const readLabel = isEn ? "Read article" : "Lire l'article";
  const readTimeLabel = isEn
    ? `${article.readingTime || 3} min read`
    : `${article.readingTime || 3} min de lecture`;

  const formattedDate = new Date(article.publishedAt || article.createdAt).toLocaleDateString(
    isEn ? "en-US" : "fr-FR",
    {
      day: "numeric",
      month: "short",
      year: "numeric",
    }
  );

  return (
    <article className="group flex flex-col bg-white dark:bg-zinc-900 rounded-2xl border border-zinc-200 dark:border-zinc-800 overflow-hidden shadow-xs hover:shadow-xl hover:border-primary/40 transition-all duration-300">
      {/* Featured Image */}
      <Link href={href} className="relative aspect-[16/10] overflow-hidden bg-zinc-100 dark:bg-zinc-800 block">
        {article.featuredImage ? (
          <Image
            src={article.featuredImage}
            alt={article.title}
            fill
            priority={priority}
            loading={loading || (priority ? "eager" : undefined)}
            className="object-cover group-hover:scale-105 transition-transform duration-500 ease-out"
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
          />
        ) : (
          <div className="w-full h-full flex flex-col items-center justify-center text-zinc-400 dark:text-zinc-600">
            <FileText className="w-10 h-10 mb-2 opacity-50" />
            <span className="text-xs font-semibold">Car Relais</span>
          </div>
        )}

        {/* Category Badge overlay */}
        <div className="absolute top-3 left-3 z-10">
          <span
            className={`px-3 py-1 rounded-full text-xs font-bold shadow-md ${categoryConfig.badgeColor}`}
          >
            {isEn ? categoryConfig.labelEn : categoryConfig.labelFr}
          </span>
        </div>
      </Link>

      {/* Card Content */}
      <div className="p-5 flex-1 flex flex-col justify-between space-y-4">
        <div className="space-y-2.5">
          {/* Metadata: Date & Reading time */}
          <div className="flex items-center gap-3 text-xs text-zinc-500 dark:text-zinc-400">
            <span>{formattedDate}</span>
            <span>•</span>
            <div className="flex items-center gap-1">
              <Clock className="w-3.5 h-3.5 text-zinc-400" />
              <span>{readTimeLabel}</span>
            </div>
          </div>

          {/* Title */}
          <h2 className="text-lg font-bold text-zinc-900 dark:text-zinc-100 group-hover:text-primary transition-colors line-clamp-2 leading-snug">
            <Link href={href}>{article.title}</Link>
          </h2>

          {/* Excerpt */}
          {article.excerpt && (
            <p className="text-xs text-zinc-600 dark:text-zinc-400 line-clamp-3 leading-relaxed">
              {article.excerpt}
            </p>
          )}
        </div>

        {/* Card Footer: Read article button */}
        <div className="pt-3 border-t border-zinc-100 dark:border-zinc-800/80 flex items-center justify-between">
          <span className="text-xs font-semibold text-zinc-500">
            {article.author?.name || "Car Relais"}
          </span>

          <Link
            href={href}
            className="inline-flex items-center gap-1.5 text-xs font-bold text-primary hover:text-primary/80 group-hover:translate-x-1 transition-all"
          >
            <span>{readLabel}</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>
      </div>
    </article>
  );
}
