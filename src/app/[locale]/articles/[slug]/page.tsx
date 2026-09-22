import { permanentRedirect } from "next/navigation";

export default async function ArticleSlugRedirectPage(props: {
  params: Promise<{ locale: string; slug: string }>;
}) {
  const { locale, slug } = await props.params;
  const destination =
    locale === "en" ? `/en/learn/${slug}` : `/fr/apprendre/${slug}`;
  permanentRedirect(destination);
}
