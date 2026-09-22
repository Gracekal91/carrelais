import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth";
import { getAdminArticles } from "@/lib/articles";
import ArticlesTableClient from "@/components/admin/articles/ArticlesTableClient";

export default async function AdminArticlesPage(props: {
  searchParams: Promise<{
    page?: string;
    pageSize?: string;
    search?: string;
    status?: string;
    language?: string;
    category?: string;
  }>;
}) {
  const user = await getCurrentUser();
  if (!user || user.role !== "SUPER_ADMIN") {
    redirect("/admin");
  }

  const searchParams = await props.searchParams;
  const { articles, totalCount, currentPage, totalPages, pageSize } =
    await getAdminArticles({
      page: Number(searchParams.page) || 1,
      pageSize: Number(searchParams.pageSize) || 10,
      search: searchParams.search,
      status: searchParams.status,
      language: searchParams.language,
      category: searchParams.category,
    });

  return (
    <div className="space-y-6">
      <ArticlesTableClient
        articles={articles}
        totalCount={totalCount}
        currentPage={currentPage}
        totalPages={totalPages}
        pageSize={pageSize}
      />
    </div>
  );
}
