"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import {
  ArrowLeft,
  Save,
  Send,
  Eye,
  Upload,
  X,
  Sparkles,
  HelpCircle,
  Loader2,
  CheckCircle2,
  AlertCircle,
  Globe,
  Tag,
  Clock,
  User,
  Search,
} from "lucide-react";
import Link from "next/link";
import RichTextEditor from "./RichTextEditor";
import { createArticleAction, updateArticleAction, ArticleInputData } from "@/lib/article-actions";
import {
  Article,
  ArticleCategoryKey,
  ArticleLanguage,
  ArticleStatus,
  ARTICLE_CATEGORIES,
} from "@/types/article";
import { slugify } from "@/lib/content-sanitizer";

interface ArticleFormProps {
  initialArticle?: Article;
  candidateTranslations?: { id: string; title: string; slug: string }[];
  currentUserName?: string;
}

export default function ArticleForm({
  initialArticle,
  candidateTranslations = [],
  currentUserName = "Car Relais",
}: ArticleFormProps) {
  const router = useRouter();
  const isEditing = Boolean(initialArticle);

  // Form State
  const [title, setTitle] = useState(initialArticle?.title || "");
  const [slug, setSlug] = useState(initialArticle?.slug || "");
  const [isSlugCustomized, setIsSlugCustomized] = useState(Boolean(initialArticle));
  const [language, setLanguage] = useState<ArticleLanguage>(initialArticle?.language || "fr");
  const [category, setCategory] = useState<ArticleCategoryKey>(
    initialArticle?.category || "buying-guide"
  );
  const [content, setContent] = useState(initialArticle?.content || "");
  const [excerpt, setExcerpt] = useState(initialArticle?.excerpt || "");
  const [featuredImage, setFeaturedImage] = useState(initialArticle?.featuredImage || "");
  const [featuredImageCaption, setFeaturedImageCaption] = useState(
    initialArticle?.featuredImageCaption || ""
  );
  const [authorName, setAuthorName] = useState(
    initialArticle?.author?.name || currentUserName || "Car Relais"
  );
  const [authorRole, setAuthorRole] = useState(
    initialArticle?.author?.role || "Rédaction"
  );
  const [readingTime, setReadingTime] = useState<number>(
    initialArticle?.readingTime || 3
  );
  const [tagsInput, setTagsInput] = useState(
    initialArticle?.tags?.join(", ") || ""
  );
  const [seoTitle, setSeoTitle] = useState(initialArticle?.seoTitle || "");
  const [seoDescription, setSeoDescription] = useState(
    initialArticle?.seoDescription || ""
  );
  const [translationId, setTranslationId] = useState(
    initialArticle?.translationId || ""
  );
  const [publishedAt, setPublishedAt] = useState(
    initialArticle?.publishedAt
      ? new Date(initialArticle.publishedAt).toISOString().slice(0, 16)
      : ""
  );

  // Status & Upload
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isUploadingImage, setIsUploadingImage] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  // Handle Title change: auto-generate slug if not customized
  const handleTitleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setTitle(val);
    if (!isSlugCustomized) {
      setSlug(slugify(val));
    }
  };

  // Upload featured image to Cloudflare R2
  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      setIsUploadingImage(true);
      setErrorMessage(null);

      const formData = new FormData();
      formData.append("file", file);
      formData.append("folder", "articles");

      const res = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || "Échec du téléversement de l'image");
      }

      setFeaturedImage(data.publicUrl);
    } catch (err: any) {
      setErrorMessage(err.message || "Erreur lors du téléversement de l'image");
    } finally {
      setIsUploadingImage(false);
    }
  };

  // Submit Handler
  const handleSubmit = async (targetStatus: ArticleStatus) => {
    try {
      setIsSubmitting(true);
      setErrorMessage(null);
      setSuccessMessage(null);

      if (!title.trim()) {
        setErrorMessage("Le titre de l'article est obligatoire.");
        return;
      }
      if (!content.trim()) {
        setErrorMessage("Le contenu de l'article est obligatoire.");
        return;
      }

      const tags = tagsInput
        .split(",")
        .map((t) => t.trim())
        .filter(Boolean);

      const payload: ArticleInputData = {
        title: title.trim(),
        slug: slug.trim() ? slugify(slug) : slugify(title),
        language,
        category,
        content,
        excerpt: excerpt.trim(),
        featuredImage: featuredImage.trim() || undefined,
        featuredImageCaption: featuredImageCaption.trim() || undefined,
        authorName: authorName.trim(),
        authorRole: authorRole.trim(),
        status: targetStatus,
        readingTime: Number(readingTime) || 3,
        tags,
        seoTitle: seoTitle.trim() || undefined,
        seoDescription: seoDescription.trim() || undefined,
        translationId: translationId || undefined,
        publishedAt: publishedAt ? new Date(publishedAt).toISOString() : undefined,
      };

      if (isEditing && initialArticle) {
        const res = await updateArticleAction(initialArticle.id, payload);
        if (!res.success) {
          setErrorMessage(res.error || "Erreur de mise à jour");
          return;
        }
        setSuccessMessage("Article mis à jour avec succès !");
        setTimeout(() => {
          router.push("/admin/articles");
          router.refresh();
        }, 1200);
      } else {
        const res = await createArticleAction(payload);
        if (!res.success) {
          setErrorMessage(res.error || "Erreur de création");
          return;
        }
        setSuccessMessage(
          targetStatus === "PUBLISHED"
            ? "Article publié avec succès !"
            : "Brouillon enregistré avec succès !"
        );
        setTimeout(() => {
          router.push("/admin/articles");
          router.refresh();
        }, 1200);
      }
    } catch (err: any) {
      setErrorMessage(err.message || "Une erreur inattendue est survenue.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const previewHref = initialArticle
    ? `/admin/articles/${initialArticle.id}/preview`
    : null;

  return (
    <div className="space-y-6 max-w-5xl mx-auto pb-16">
      {/* Top Header & Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-zinc-200 dark:border-zinc-800 pb-4">
        <div className="flex items-center gap-3">
          <Link
            href="/admin/articles"
            className="p-2 rounded-xl text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-100 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"
            title="Retour à la liste"
          >
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <div>
            <h1 className="text-xl font-bold text-zinc-900 dark:text-zinc-100">
              {isEditing ? "Modifier l'article" : "Créer un nouvel article"}
            </h1>
            <p className="text-xs text-zinc-500">
              {initialArticle
                ? `ID: ${initialArticle.id} • Statut actuel : ${initialArticle.status}`
                : "Remplissez les informations ci-dessous pour rédiger un article"}
            </p>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center flex-wrap gap-2">
          {previewHref && (
            <Link
              href={previewHref}
              target="_blank"
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl border border-zinc-200 dark:border-zinc-700 hover:bg-zinc-100 dark:hover:bg-zinc-800 text-xs font-semibold text-zinc-700 dark:text-zinc-300 transition-colors"
            >
              <Eye className="w-3.5 h-3.5" />
              <span>Aperçu</span>
            </Link>
          )}

          <button
            type="button"
            onClick={() => handleSubmit("DRAFT")}
            disabled={isSubmitting}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl border border-zinc-300 dark:border-zinc-700 hover:bg-zinc-100 dark:hover:bg-zinc-800 text-xs font-semibold text-zinc-800 dark:text-zinc-200 transition-colors cursor-pointer"
          >
            {isSubmitting ? (
              <Loader2 className="w-3.5 h-3.5 animate-spin" />
            ) : (
              <Save className="w-3.5 h-3.5" />
            )}
            <span>Enregistrer brouillon</span>
          </button>

          <button
            type="button"
            onClick={() => handleSubmit("PUBLISHED")}
            disabled={isSubmitting}
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-primary text-white hover:bg-primary/90 text-xs font-bold transition-all shadow-md shadow-primary/20 cursor-pointer"
          >
            {isSubmitting ? (
              <Loader2 className="w-3.5 h-3.5 animate-spin" />
            ) : (
              <Send className="w-3.5 h-3.5" />
            )}
            <span>{isEditing ? "Mettre à jour & Publier" : "Publier l'article"}</span>
          </button>
        </div>
      </div>

      {/* Notifications */}
      {errorMessage && (
        <div className="p-4 rounded-xl bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-900 text-red-700 dark:text-red-300 text-sm flex items-center gap-2.5">
          <AlertCircle className="w-5 h-5 shrink-0" />
          <span>{errorMessage}</span>
        </div>
      )}

      {successMessage && (
        <div className="p-4 rounded-xl bg-green-50 dark:bg-green-950/40 border border-green-200 dark:border-green-900 text-green-700 dark:text-green-300 text-sm flex items-center gap-2.5">
          <CheckCircle2 className="w-5 h-5 shrink-0" />
          <span>{successMessage}</span>
        </div>
      )}

      {/* Form Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column (2 Cols): Main Editorial Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Title & Slug */}
          <div className="bg-white dark:bg-zinc-900 p-5 rounded-2xl border border-zinc-200 dark:border-zinc-800 space-y-4 shadow-xs">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-zinc-600 dark:text-zinc-400 mb-1.5">
                Titre de l&apos;article <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={title}
                onChange={handleTitleChange}
                placeholder="Ex: Prix du Toyota Land Cruiser en RDC : Guide complet 2026"
                className="w-full px-3.5 py-2.5 rounded-xl border border-zinc-300 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 text-base font-semibold focus:outline-none focus:ring-2 focus:ring-primary"
              />
            </div>

            {/* Slug */}
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="text-xs font-bold uppercase tracking-wider text-zinc-600 dark:text-zinc-400">
                  Slug URL <span className="text-red-500">*</span>
                </label>
                <button
                  type="button"
                  onClick={() => {
                    setIsSlugCustomized(false);
                    setSlug(slugify(title));
                  }}
                  className="text-[11px] text-primary hover:underline"
                >
                  Régénérer depuis le titre
                </button>
              </div>
              <div className="flex items-center rounded-xl border border-zinc-300 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800 overflow-hidden focus-within:ring-2 focus-within:ring-primary text-xs">
                <span className="px-3 py-2 text-zinc-400 bg-zinc-100 dark:bg-zinc-800/80 border-r border-zinc-200 dark:border-zinc-700 select-none">
                  /{language === "en" ? "en/learn" : "fr/apprendre"}/
                </span>
                <input
                  type="text"
                  value={slug}
                  onChange={(e) => {
                    setIsSlugCustomized(true);
                    setSlug(e.target.value);
                  }}
                  placeholder="slug-de-l-article"
                  className="flex-1 px-3 py-2 bg-transparent text-zinc-900 dark:text-zinc-100 focus:outline-none font-mono"
                />
              </div>
              <p className="text-[11px] text-zinc-400 mt-1">
                Le slug doit être unique pour la langue sélectionnée. Les tirets séparent les mots.
              </p>
            </div>
          </div>

          {/* Excerpt */}
          <div className="bg-white dark:bg-zinc-900 p-5 rounded-2xl border border-zinc-200 dark:border-zinc-800 space-y-2 shadow-xs">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold uppercase tracking-wider text-zinc-600 dark:text-zinc-400">
                Extrait / Résumé (Chapeau)
              </label>
              <span
                className={`text-[11px] ${
                  excerpt.length > 200 ? "text-amber-500 font-bold" : "text-zinc-400"
                }`}
              >
                {excerpt.length}/200 caractères
              </span>
            </div>
            <textarea
              rows={3}
              value={excerpt}
              onChange={(e) => setExcerpt(e.target.value)}
              placeholder="Court résumé introductif qui sera affiché sur les cartes d'articles et les aperçus sociaux..."
              className="w-full px-3.5 py-2.5 rounded-xl border border-zinc-300 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
            />
          </div>

          {/* Rich Content Editor */}
          <div className="bg-white dark:bg-zinc-900 p-5 rounded-2xl border border-zinc-200 dark:border-zinc-800 space-y-3 shadow-xs">
            <label className="block text-xs font-bold uppercase tracking-wider text-zinc-600 dark:text-zinc-400">
              Corps de l&apos;article (Éditeur enrichi) <span className="text-red-500">*</span>
            </label>
            <RichTextEditor
              value={content}
              onChange={setContent}
              placeholder="Rédigez l'article avec des sous-titres, des paragraphes, des citations, des images et des listes..."
            />
          </div>

          {/* SEO Metadata Box */}
          <div className="bg-white dark:bg-zinc-900 p-5 rounded-2xl border border-zinc-200 dark:border-zinc-800 space-y-4 shadow-xs">
            <div className="flex items-center gap-2 pb-2 border-b border-zinc-100 dark:border-zinc-800">
              <Sparkles className="w-4 h-4 text-primary" />
              <h3 className="text-sm font-bold text-zinc-900 dark:text-zinc-100">
                Optimisation pour les moteurs de recherche (SEO)
              </h3>
            </div>

            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="text-xs font-semibold text-zinc-600 dark:text-zinc-400">
                  Titre SEO (&lt;title&gt;)
                </label>
                <span className="text-[11px] text-zinc-400">{seoTitle.length}/60 car.</span>
              </div>
              <input
                type="text"
                value={seoTitle}
                onChange={(e) => setSeoTitle(e.target.value)}
                placeholder={title || "Titre personnalisé pour Google (par défaut le titre de l'article)"}
                className="w-full px-3 py-2 rounded-xl border border-zinc-300 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 text-xs focus:outline-none focus:ring-2 focus:ring-primary"
              />
            </div>

            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="text-xs font-semibold text-zinc-600 dark:text-zinc-400">
                  Méta Description Google
                </label>
                <span className="text-[11px] text-zinc-400">{seoDescription.length}/160 car.</span>
              </div>
              <textarea
                rows={2}
                value={seoDescription}
                onChange={(e) => setSeoDescription(e.target.value)}
                placeholder={excerpt || "Description attrayante pour inciter au clic dans les résultats de recherche..."}
                className="w-full px-3 py-2 rounded-xl border border-zinc-300 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 text-xs focus:outline-none focus:ring-2 focus:ring-primary"
              />
            </div>
          </div>
        </div>

        {/* Right Column (1 Col): Settings & Metadata */}
        <div className="space-y-6">
          {/* Publication & Status Settings */}
          <div className="bg-white dark:bg-zinc-900 p-5 rounded-2xl border border-zinc-200 dark:border-zinc-800 space-y-4 shadow-xs">
            <h3 className="text-xs font-bold uppercase tracking-wider text-zinc-600 dark:text-zinc-400 pb-2 border-b border-zinc-100 dark:border-zinc-800">
              Paramètres de publication
            </h3>

            {/* Language */}
            <div>
              <label className="block text-xs font-semibold text-zinc-600 dark:text-zinc-400 mb-1.5 flex items-center gap-1.5">
                <Globe className="w-3.5 h-3.5 text-primary" />
                <span>Langue de l&apos;article</span>
              </label>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => setLanguage("fr")}
                  className={`px-3 py-2 rounded-xl text-xs font-bold border transition-colors flex items-center justify-center gap-2 ${
                    language === "fr"
                      ? "bg-primary/10 border-primary text-primary"
                      : "border-zinc-200 dark:border-zinc-700 text-zinc-600 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800"
                  }`}
                >
                  <span>🇫🇷</span>
                  <span>Français</span>
                </button>
                <button
                  type="button"
                  onClick={() => setLanguage("en")}
                  className={`px-3 py-2 rounded-xl text-xs font-bold border transition-colors flex items-center justify-center gap-2 ${
                    language === "en"
                      ? "bg-primary/10 border-primary text-primary"
                      : "border-zinc-200 dark:border-zinc-700 text-zinc-600 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800"
                  }`}
                >
                  <span>🇬🇧</span>
                  <span>English</span>
                </button>
              </div>
            </div>

            {/* Category */}
            <div>
              <label className="block text-xs font-semibold text-zinc-600 dark:text-zinc-400 mb-1.5">
                Catégorie thématique
              </label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value as ArticleCategoryKey)}
                className="w-full px-3 py-2 rounded-xl border border-zinc-300 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 text-xs font-medium focus:outline-none focus:ring-2 focus:ring-primary"
              >
                {Object.values(ARTICLE_CATEGORIES).map((cat) => (
                  <option key={cat.key} value={cat.key}>
                    {language === "en" ? cat.labelEn : cat.labelFr}
                  </option>
                ))}
              </select>
            </div>

            {/* Publication Date (Schedule or Now) */}
            <div>
              <label className="block text-xs font-semibold text-zinc-600 dark:text-zinc-400 mb-1.5 flex items-center gap-1.5">
                <Clock className="w-3.5 h-3.5 text-primary" />
                <span>Date de publication</span>
              </label>
              <input
                type="datetime-local"
                value={publishedAt}
                onChange={(e) => setPublishedAt(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-zinc-300 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 text-xs focus:outline-none focus:ring-2 focus:ring-primary"
              />
              <p className="text-[11px] text-zinc-400 mt-1">
                Laisser vide pour publier immédiatement lors de la validation.
              </p>
            </div>

            {/* Reading Time */}
            <div>
              <label className="block text-xs font-semibold text-zinc-600 dark:text-zinc-400 mb-1">
                Temps de lecture (minutes)
              </label>
              <input
                type="number"
                min="1"
                max="60"
                value={readingTime}
                onChange={(e) => setReadingTime(Number(e.target.value))}
                className="w-full px-3 py-2 rounded-xl border border-zinc-300 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 text-xs focus:outline-none focus:ring-2 focus:ring-primary"
              />
            </div>
          </div>

          {/* Featured Image Box */}
          <div className="bg-white dark:bg-zinc-900 p-5 rounded-2xl border border-zinc-200 dark:border-zinc-800 space-y-4 shadow-xs">
            <h3 className="text-xs font-bold uppercase tracking-wider text-zinc-600 dark:text-zinc-400 pb-2 border-b border-zinc-100 dark:border-zinc-800">
              Image à la une (Featured Image)
            </h3>

            {featuredImage ? (
              <div className="space-y-3">
                <div className="relative aspect-video rounded-xl overflow-hidden border border-zinc-200 dark:border-zinc-800 bg-zinc-100 dark:bg-zinc-800">
                  <Image
                    src={featuredImage}
                    alt="Aperçu image à la une"
                    fill
                    className="object-cover"
                  />
                  <button
                    type="button"
                    onClick={() => setFeaturedImage("")}
                    className="absolute top-2 right-2 p-1.5 rounded-lg bg-black/70 hover:bg-red-600 text-white transition-colors"
                    title="Supprimer l'image"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
                <div>
                  <label className="block text-[11px] font-semibold text-zinc-500 mb-1">
                    Légende sous l&apos;image (optionnelle)
                  </label>
                  <input
                    type="text"
                    value={featuredImageCaption}
                    onChange={(e) => setFeaturedImageCaption(e.target.value)}
                    placeholder="Ex: Photo d'illustration à Kinshasa"
                    className="w-full px-3 py-1.5 rounded-lg border border-zinc-300 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 text-xs focus:outline-none focus:ring-2 focus:ring-primary"
                  />
                </div>
              </div>
            ) : (
              <div className="space-y-3">
                <label className="border-2 border-dashed border-zinc-300 dark:border-zinc-700 hover:border-primary rounded-xl p-6 flex flex-col items-center justify-center gap-2 cursor-pointer transition-colors text-center bg-zinc-50 dark:bg-zinc-800/50">
                  {isUploadingImage ? (
                    <Loader2 className="w-6 h-6 animate-spin text-primary" />
                  ) : (
                    <Upload className="w-6 h-6 text-zinc-400" />
                  )}
                  <span className="text-xs font-semibold text-zinc-700 dark:text-zinc-300">
                    {isUploadingImage
                      ? "Téléversement en cours..."
                      : "Cliquez pour téléverser une photo"}
                  </span>
                  <span className="text-[10px] text-zinc-400">
                    PNG, JPG, WebP jusqu&apos;à 15 Mo
                  </span>
                  <input
                    type="file"
                    accept="image/jpeg,image/png,image/webp,image/avif"
                    onChange={handleImageUpload}
                    disabled={isUploadingImage}
                    className="hidden"
                  />
                </label>

                <div className="relative flex items-center justify-center my-2">
                  <div className="border-t border-zinc-200 dark:border-zinc-800 w-full" />
                  <span className="bg-white dark:bg-zinc-900 px-2 text-[10px] text-zinc-400 uppercase font-bold absolute">
                    ou URL
                  </span>
                </div>

                <input
                  type="url"
                  placeholder="https://images.carrelais.com/..."
                  value={featuredImage}
                  onChange={(e) => setFeaturedImage(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-zinc-300 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 text-xs focus:outline-none focus:ring-2 focus:ring-primary"
                />
              </div>
            )}
          </div>

          {/* Multilingual Translation Linking */}
          <div className="bg-white dark:bg-zinc-900 p-5 rounded-2xl border border-zinc-200 dark:border-zinc-800 space-y-3 shadow-xs">
            <div className="flex items-center gap-1.5 pb-2 border-b border-zinc-100 dark:border-zinc-800">
              <Globe className="w-4 h-4 text-primary" />
              <h3 className="text-xs font-bold uppercase tracking-wider text-zinc-600 dark:text-zinc-400">
                Liaison de traduction
              </h3>
            </div>
            <p className="text-xs text-zinc-500">
              Associez cet article à sa version traduite en{" "}
              <strong>{language === "fr" ? "Anglais" : "Français"}</strong> pour afficher
              le sélecteur de langue et les balises SEO <code>hreflang</code>.
            </p>

            <select
              value={translationId}
              onChange={(e) => setTranslationId(e.target.value)}
              className="w-full px-3 py-2 rounded-xl border border-zinc-300 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 text-xs focus:outline-none focus:ring-2 focus:ring-primary"
            >
              <option value="">-- Aucune traduction liée --</option>
              {candidateTranslations.map((cand) => (
                <option key={cand.id} value={cand.id}>
                  {cand.title} ({cand.slug})
                </option>
              ))}
            </select>
          </div>

          {/* Author Attribution */}
          <div className="bg-white dark:bg-zinc-900 p-5 rounded-2xl border border-zinc-200 dark:border-zinc-800 space-y-3 shadow-xs">
            <div className="flex items-center gap-1.5 pb-2 border-b border-zinc-100 dark:border-zinc-800">
              <User className="w-4 h-4 text-primary" />
              <h3 className="text-xs font-bold uppercase tracking-wider text-zinc-600 dark:text-zinc-400">
                Auteur & Signature
              </h3>
            </div>
            <div>
              <label className="block text-[11px] font-semibold text-zinc-500 mb-1">
                Nom de l&apos;auteur
              </label>
              <input
                type="text"
                value={authorName}
                onChange={(e) => setAuthorName(e.target.value)}
                placeholder="Car Relais"
                className="w-full px-3 py-1.5 rounded-lg border border-zinc-300 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 text-xs focus:outline-none focus:ring-2 focus:ring-primary"
              />
            </div>
            <div>
              <label className="block text-[11px] font-semibold text-zinc-500 mb-1">
                Rôle ou titre
              </label>
              <input
                type="text"
                value={authorRole}
                onChange={(e) => setAuthorRole(e.target.value)}
                placeholder="Rédaction Car Relais"
                className="w-full px-3 py-1.5 rounded-lg border border-zinc-300 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 text-xs focus:outline-none focus:ring-2 focus:ring-primary"
              />
            </div>
          </div>

          {/* Tags */}
          <div className="bg-white dark:bg-zinc-900 p-5 rounded-2xl border border-zinc-200 dark:border-zinc-800 space-y-3 shadow-xs">
            <div className="flex items-center gap-1.5 pb-2 border-b border-zinc-100 dark:border-zinc-800">
              <Tag className="w-4 h-4 text-primary" />
              <h3 className="text-xs font-bold uppercase tracking-wider text-zinc-600 dark:text-zinc-400">
                Tags & Mots-clés
              </h3>
            </div>
            <div>
              <input
                type="text"
                value={tagsInput}
                onChange={(e) => setTagsInput(e.target.value)}
                placeholder="Toyota, Land Cruiser, Kinshasa, Prix"
                className="w-full px-3 py-2 rounded-lg border border-zinc-300 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 text-xs focus:outline-none focus:ring-2 focus:ring-primary"
              />
              <p className="text-[11px] text-zinc-400 mt-1">
                Séparez les tags par des virgules.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
