import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth";
import { getCandidateTranslations } from "@/lib/articles";
import ArticleForm from "@/components/admin/articles/ArticleForm";

export default async function CreateArticlePage(props: {
  searchParams: Promise<{ lang?: string }>;
}) {
  const user = await getCurrentUser();
  if (!user || user.role !== "SUPER_ADMIN") {
    redirect("/admin");
  }

  const searchParams = await props.searchParams;
  const targetLanguage = searchParams.lang === "en" ? "en" : "fr";
  const candidateLanguage = targetLanguage === "fr" ? "en" : "fr";

  const candidateTranslations = await getCandidateTranslations(candidateLanguage);

  return (
    <ArticleForm
      candidateTranslations={candidateTranslations}
      currentUserName={`${user.firstName} ${user.lastName}`}
    />
  );
}
