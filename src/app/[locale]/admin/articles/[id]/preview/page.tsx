import { redirect, notFound } from "next/navigation";
import { getCurrentUser } from "@/lib/auth";
import { getArticleById, getConnectedTranslation, getRelatedArticles } from "@/lib/articles";
import ArticleDetailPage from "@/components/articles/ArticleDetailPage";

export default async function AdminArticlePreviewPage(props: {
  params: Promise<{ id: string; locale?: string }>;
}) {
  const user = await getCurrentUser();
  if (!user || user.role !== "SUPER_ADMIN") {
    redirect("/admin");
  }

  const params = await props.params;
  const article = await getArticleById(params.id);
  if (!article) {
    notFound();
  }

  const [relatedArticles, translatedArticle] = await Promise.all([
    getRelatedArticles(article.id, article.category, article.language, 3),
    getConnectedTranslation(article.id, article.translationId),
  ]);

  return (
    <ArticleDetailPage
      article={article}
      relatedArticles={relatedArticles}
      translatedArticle={translatedArticle}
      locale={article.language}
      isPreview={true}
    />
  );
}
