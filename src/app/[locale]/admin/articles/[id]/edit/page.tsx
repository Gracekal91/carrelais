import { redirect, notFound } from "next/navigation";
import { getCurrentUser } from "@/lib/auth";
import { getArticleById, getCandidateTranslations } from "@/lib/articles";
import ArticleForm from "@/components/admin/articles/ArticleForm";

export default async function EditArticlePage(props: {
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

  const candidateLanguage = article.language === "fr" ? "en" : "fr";
  const candidateTranslations = await getCandidateTranslations(
    candidateLanguage,
    article.id
  );

  return (
    <ArticleForm
      initialArticle={article}
      candidateTranslations={candidateTranslations}
      currentUserName={`${user.firstName} ${user.lastName}`}
    />
  );
}
