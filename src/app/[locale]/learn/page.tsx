import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { getPublishedArticles, getCategoryArticleCounts } from "@/lib/articles";
import LearnLandingPage from "@/components/articles/LearnLandingPage";
import { getBaseUrl } from "@/lib/url";

export const revalidate = 60;

export async function generateMetadata(): Promise<Metadata> {
  const baseUrl = getBaseUrl();
  const title = "Learn - Car Relais Automotive Guides & Market News";
  const description =
    "Discover expert car buying advice, vehicle pricing benchmarks in DRC, maintenance tips, customs importation, and automotive news.";

  const canonicalUrl = `${baseUrl}/en/learn`;

  return {
    title,
    description,
    alternates: {
      canonical: canonicalUrl,
      languages: {
        en: `${baseUrl}/en/learn`,
        fr: `${baseUrl}/apprendre`,
      },
    },
    openGraph: {
      title,
      description,
      url: canonicalUrl,
      siteName: "Car Relais",
      locale: "en_US",
      type: "website",
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
    },
  };
}

export default async function EnglishLearnPage(props: {
  params: Promise<{ locale: string }>;
  searchParams: Promise<{ category?: string; q?: string; page?: string }>;
}) {
  const params = await props.params;
  const searchParams = await props.searchParams;

  // If user is accessing French locale on /learn, redirect to /apprendre
  if (params.locale === "fr") {
    const query = new URLSearchParams(searchParams as Record<string, string>).toString();
    redirect(query ? `/apprendre?${query}` : "/apprendre");
  }

  const locale = "en";
  const [data, categoryCounts] = await Promise.all([
    getPublishedArticles({
      locale,
      category: searchParams.category,
      q: searchParams.q,
      page: Number(searchParams.page) || 1,
      pageSize: 9,
    }),
    getCategoryArticleCounts(locale),
  ]);

  return (
    <LearnLandingPage
      articles={data.articles}
      totalCount={data.totalCount}
      currentPage={data.currentPage}
      totalPages={data.totalPages}
      locale={locale}
      categoryCounts={categoryCounts}
      selectedCategory={searchParams.category || "all"}
      searchQuery={searchParams.q || ""}
    />
  );
}
