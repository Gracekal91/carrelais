import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { getPublishedArticles, getCategoryArticleCounts } from "@/lib/articles";
import LearnLandingPage from "@/components/articles/LearnLandingPage";

export const revalidate = 60; // Revalidate every 60 seconds

export async function generateMetadata(props: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await props.params;
  const isEn = locale === "en";

  const title = isEn ? "Learn - Car Relais Automotive Guides" : "Apprendre - Guides & Actualités Automobiles Car Relais";
  const description = isEn
    ? "Expert automotive guides, car prices, maintenance advice, and market insights in DRC."
    : "Guides automobiles d'experts, prix des véhicules, conseils d'entretien, démarches d'importation et actualités du marché en RDC.";

  const canonicalUrl = isEn ? "https://carrelais.com/en/learn" : "https://carrelais.com/apprendre";

  return {
    title,
    description,
    alternates: {
      canonical: canonicalUrl,
      languages: {
        fr: "https://carrelais.com/apprendre",
        en: "https://carrelais.com/en/learn",
      },
    },
    openGraph: {
      title,
      description,
      url: canonicalUrl,
      siteName: "Car Relais",
      locale: isEn ? "en_US" : "fr_FR",
      type: "website",
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
    },
  };
}

export default async function ApprendrePage(props: {
  params: Promise<{ locale: string }>;
  searchParams: Promise<{ category?: string; q?: string; page?: string }>;
}) {
  const params = await props.params;
  const searchParams = await props.searchParams;

  // If user is accessing English locale on /apprendre, redirect to /en/learn
  if (params.locale === "en") {
    const query = new URLSearchParams(searchParams as Record<string, string>).toString();
    redirect(query ? `/en/learn?${query}` : "/en/learn");
  }

  const locale = "fr";
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
