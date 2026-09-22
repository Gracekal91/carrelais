import type { MetadataRoute } from "next";
import { connectToDatabase } from "@/lib/mongodb";
import { ListingModel } from "@/lib/models/Listing";
import { ArticleModel } from "@/lib/models/Article";
import { UserModel } from "@/lib/models/User";

export const revalidate = 3600; // Cache sitemap for 1 hour

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl =
    process.env.NEXT_PUBLIC_APP_URL && !process.env.NEXT_PUBLIC_APP_URL.includes("localhost")
      ? process.env.NEXT_PUBLIC_APP_URL
      : "https://carrelais.cd";

  const now = new Date();

  // Core static landing pages
  const staticRoutes: MetadataRoute.Sitemap = [
    {
      url: `${baseUrl}`,
      lastModified: now,
      changeFrequency: "daily",
      priority: 1.0,
      alternates: {
        languages: {
          fr: `${baseUrl}`,
          en: `${baseUrl}/en`,
        },
      },
    },
    {
      url: `${baseUrl}/vehicles`,
      lastModified: now,
      changeFrequency: "hourly",
      priority: 0.9,
      alternates: {
        languages: {
          fr: `${baseUrl}/vehicles`,
          en: `${baseUrl}/en/vehicles`,
        },
      },
    },
    {
      url: `${baseUrl}/apprendre`,
      lastModified: now,
      changeFrequency: "daily",
      priority: 0.8,
      alternates: {
        languages: {
          fr: `${baseUrl}/apprendre`,
          en: `${baseUrl}/en/learn`,
        },
      },
    },
    {
      url: `${baseUrl}/en`,
      lastModified: now,
      changeFrequency: "daily",
      priority: 0.9,
      alternates: {
        languages: {
          fr: `${baseUrl}`,
          en: `${baseUrl}/en`,
        },
      },
    },
    {
      url: `${baseUrl}/en/vehicles`,
      lastModified: now,
      changeFrequency: "hourly",
      priority: 0.9,
      alternates: {
        languages: {
          fr: `${baseUrl}/vehicles`,
          en: `${baseUrl}/en/vehicles`,
        },
      },
    },
    {
      url: `${baseUrl}/en/learn`,
      lastModified: now,
      changeFrequency: "daily",
      priority: 0.8,
      alternates: {
        languages: {
          fr: `${baseUrl}/apprendre`,
          en: `${baseUrl}/en/learn`,
        },
      },
    },
  ];

  try {
    await connectToDatabase();

    const [publishedListings, publishedArticles, verifiedDealers] = await Promise.all([
      ListingModel.find({ status: "PUBLISHED" })
        .select("slug updatedAt createdAt")
        .lean()
        .exec()
        .catch(() => []),
      ArticleModel.find({ status: "PUBLISHED" })
        .select("slug language updatedAt publishedAt")
        .lean()
        .exec()
        .catch(() => []),
      UserModel.find({ accountType: "DEALERSHIP", isVerified: true })
        .select("_id updatedAt")
        .lean()
        .exec()
        .catch(() => []),
    ]);

    interface ListingDoc {
      slug?: string;
      updatedAt?: Date | string;
      createdAt?: Date | string;
    }
    interface ArticleDoc {
      slug?: string;
      language?: string;
      updatedAt?: Date | string;
      publishedAt?: Date | string;
    }
    interface DealerDoc {
      _id?: { toString(): string };
      updatedAt?: Date | string;
    }

    // Vehicle detail pages (bilingual alternates)
    const vehicleRoutes: MetadataRoute.Sitemap = (publishedListings as ListingDoc[])
      .filter((listing): listing is ListingDoc & { slug: string } => Boolean(listing.slug))
      .flatMap((listing) => {
        const lastMod = listing.updatedAt || listing.createdAt || now;
        return [
          {
            url: `${baseUrl}/vehicles/${listing.slug}`,
            lastModified: new Date(lastMod),
            changeFrequency: "daily" as const,
            priority: 0.8,
            alternates: {
              languages: {
                fr: `${baseUrl}/vehicles/${listing.slug}`,
                en: `${baseUrl}/en/vehicles/${listing.slug}`,
              },
            },
          },
          {
            url: `${baseUrl}/en/vehicles/${listing.slug}`,
            lastModified: new Date(lastMod),
            changeFrequency: "daily" as const,
            priority: 0.8,
            alternates: {
              languages: {
                fr: `${baseUrl}/vehicles/${listing.slug}`,
                en: `${baseUrl}/en/vehicles/${listing.slug}`,
              },
            },
          },
        ];
      });

    // Article detail pages
    const articleRoutes: MetadataRoute.Sitemap = (publishedArticles as ArticleDoc[])
      .filter((article): article is ArticleDoc & { slug: string } => Boolean(article.slug))
      .map((article) => {
        const lastMod = article.updatedAt || article.publishedAt || now;
        const isEn = article.language === "en";
        const path = isEn ? `/en/learn/${article.slug}` : `/apprendre/${article.slug}`;

        return {
          url: `${baseUrl}${path}`,
          lastModified: new Date(lastMod),
          changeFrequency: "weekly" as const,
          priority: 0.7,
        };
      });

    // Dealer profile pages
    const dealerRoutes: MetadataRoute.Sitemap = (verifiedDealers as DealerDoc[])
      .filter((dealer): dealer is DealerDoc & { _id: { toString(): string } } => Boolean(dealer._id))
      .flatMap((dealer) => {
        const id = dealer._id.toString();
        const lastMod = dealer.updatedAt || now;
        return [
          {
            url: `${baseUrl}/dealers/${id}`,
            lastModified: new Date(lastMod),
            changeFrequency: "weekly" as const,
            priority: 0.6,
            alternates: {
              languages: {
                fr: `${baseUrl}/dealers/${id}`,
                en: `${baseUrl}/en/dealers/${id}`,
              },
            },
          },
          {
            url: `${baseUrl}/en/dealers/${id}`,
            lastModified: new Date(lastMod),
            changeFrequency: "weekly" as const,
            priority: 0.6,
            alternates: {
              languages: {
                fr: `${baseUrl}/dealers/${id}`,
                en: `${baseUrl}/en/dealers/${id}`,
              },
            },
          },
        ];
      });

    return [...staticRoutes, ...vehicleRoutes, ...articleRoutes, ...dealerRoutes];
  } catch (error) {
    console.error("Error generating dynamic sitemap:", error);
    return staticRoutes;
  }
}
