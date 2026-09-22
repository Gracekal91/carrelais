import { permanentRedirect } from "next/navigation";

export default async function ArticlesRedirectPage(props: {
  params: Promise<{ locale: string }>;
  searchParams: Promise<Record<string, string>>;
}) {
  const { locale } = await props.params;
  const searchParams = await props.searchParams;
  const query = new URLSearchParams(searchParams).toString();

  const destination = locale === "en" ? "/en/learn" : "/fr/apprendre";
  permanentRedirect(query ? `${destination}?${query}` : destination);
}
