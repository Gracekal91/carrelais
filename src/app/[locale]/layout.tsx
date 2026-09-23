import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "../globals.css";
import { Header } from "@/components/layouts/Header";
import { Footer } from "@/components/layouts/Footer";
import { MobileBottomNav } from "@/components/layouts/MobileBottomNav";
import { ThemeProvider } from "@/components/ThemeProvider";
import { NextIntlClientProvider } from 'next-intl';
import { getMessages } from 'next-intl/server';
import { notFound } from 'next/navigation';
import { routing } from '@/i18n/routing';
import { getBaseUrl } from '@/lib/url';

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export async function generateMetadata(props: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await props.params;
  const isEn = locale === "en";
  const baseUrl = getBaseUrl();

  const titleDefault = isEn
    ? "Car Relais — Premier Automotive Marketplace in DRC"
    : "Car Relais — #1 Marché Automobile en RDC | Voitures d'occasion & neuves";

  const description = isEn
    ? "Buy, sell, and import verified vehicles in the Democratic Republic of Congo. Discover cars for sale in Kinshasa and Lubumbashi from verified dealers."
    : "Le premier marché automobile en RDC. Achetez, vendez et importez des véhicules vérifiés à Kinshasa et Lubumbashi. Voitures disponibles localement ou prêtes pour importation.";

  return {
    metadataBase: new URL(baseUrl),
    title: {
      default: titleDefault,
      template: isEn ? "%s | Car Relais DRC" : "%s | Car Relais RDC",
    },
    description,
    keywords: [
      "voiture occasion kinshasa",
      "vente voiture rdc",
      "achat voiture congo",
      "car relais",
      "importation voiture congo",
      "toyota occasion kinshasa",
      "concessionnaire kinshasa",
      "cars for sale drc",
      "kinshasa auto marketplace",
      "lubumbashi car sales",
    ],
    authors: [{ name: "Car Relais", url: baseUrl }],
    creator: "Car Relais",
    publisher: "Car Relais",
    formatDetection: {
      telephone: true,
      email: true,
      address: true,
    },
    alternates: {
      canonical: isEn ? `${baseUrl}/en` : `${baseUrl}`,
      languages: {
        fr: `${baseUrl}`,
        en: `${baseUrl}/en`,
        "x-default": `${baseUrl}`,
      },
    },
    openGraph: {
      type: "website",
      locale: isEn ? "en_US" : "fr_FR",
      url: isEn ? `${baseUrl}/en` : `${baseUrl}`,
      siteName: "Car Relais",
      title: titleDefault,
      description,
      images: [
        {
          url: "https://images.unsplash.com/photo-1492144534655-ae79c964c9d7?auto=format&fit=crop&w=1200&h=630&q=85",
          width: 1200,
          height: 630,
          alt: "Car Relais - Marché Automobile en RDC",
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title: titleDefault,
      description,
      images: ["https://images.unsplash.com/photo-1492144534655-ae79c964c9d7?auto=format&fit=crop&w=1200&h=630&q=85"],
    },
    robots: {
      index: true,
      follow: true,
      googleBot: {
        index: true,
        follow: true,
        "max-video-preview": -1,
        "max-image-preview": "large",
        "max-snippet": -1,
      },
    },
    other: {
      "geo.region": "CD-KN",
      "geo.placename": "Kinshasa, République Démocratique du Congo",
      "geo.position": "-4.322447;15.307045",
      "ICBM": "-4.322447, 15.307045",
    },
  };
}

export default async function RootLayout(props: {
  children: React.ReactNode;
  params: Promise<{locale: string}>;
}) {
  const params = await props.params;
  const { locale } = params;
  
  if (!(routing.locales as readonly string[]).includes(locale)) {
    notFound();
  }

  const messages = await getMessages();

  return (
    <html lang={locale} suppressHydrationWarning className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}>
      <body className="min-h-full flex flex-col bg-background text-foreground">
        <NextIntlClientProvider messages={messages}>
          <ThemeProvider
            attribute="class"
            defaultTheme="system"
            enableSystem
            disableTransitionOnChange
          >
            <Header />
            <main className="flex-1 flex flex-col pb-16 lg:pb-0">
              {props.children}
            </main>
            <Footer />
            <MobileBottomNav />
          </ThemeProvider>
        </NextIntlClientProvider>
      </body>
    </html>
  );
}

