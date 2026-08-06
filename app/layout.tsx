import type { Metadata } from "next";
import { headers } from "next/headers";
import "@fontsource/material-symbols-rounded/400.css";
import "./globals.css";

const siteName = "Pullario";
const siteDescription =
  "Tienda TCG para abrir cajas de One Piece, Pokemon y Magic con probabilidades visibles, buscador de cartas y gestion de inventario local.";
const keywords = [
  "Pullario",
  "cajas TCG",
  "booster packs",
  "cartas Pokemon",
  "cartas One Piece",
  "cartas Magic",
  "TCG marketplace",
  "probabilidades de cajas",
  "buscador de cartas",
];

export async function generateMetadata(): Promise<Metadata> {
  const requestHeaders = await headers();
  const host =
    requestHeaders.get("x-forwarded-host") ?? requestHeaders.get("host");
  const protocol =
    requestHeaders.get("x-forwarded-proto") ??
    (host?.startsWith("localhost") ? "http" : "https");
  const baseUrl = host ? `${protocol}://${host}` : "http://localhost:3000";

  return {
    applicationName: siteName,
    title: {
      default: `${siteName} | Cajas TCG con probabilidades visibles`,
      template: `%s | ${siteName}`,
    },
    description: siteDescription,
    keywords,
    authors: [{ name: siteName }],
    creator: siteName,
    publisher: siteName,
    category: "TCG marketplace",
    metadataBase: new URL(baseUrl),
    manifest: "/manifest.webmanifest",
    robots: {
      index: true,
      follow: true,
      googleBot: {
        index: true,
        follow: true,
        "max-image-preview": "large",
        "max-snippet": -1,
        "max-video-preview": -1,
      },
    },
    openGraph: {
      title: `${siteName} | Cajas TCG con probabilidades visibles`,
      description: siteDescription,
      url: baseUrl,
      siteName,
      locale: "es_AR",
      type: "website",
      images: [
        {
          url: `${baseUrl}/og.png`,
          width: 1200,
          height: 630,
          alt: "Pullario, marketplace TCG de cajas con probabilidades visibles",
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title: `${siteName} | Cajas TCG`,
      description:
        "Cajas TCG con odds visibles, buscador de cartas e inventario.",
      images: [`${baseUrl}/og.png`],
    },
    icons: {
      icon: "/favicon.svg",
      shortcut: "/favicon.svg",
      apple: "/favicon.svg",
    },
  };
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const structuredData = {
    "@context": "https://schema.org",
    "@type": "WebApplication",
    name: siteName,
    applicationCategory: "ShoppingApplication",
    operatingSystem: "Web",
    description: siteDescription,
    offers: {
      "@type": "Offer",
      category: "Trading card game booster packs",
    },
  };

  return (
    <html lang="es">
      <body>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
        />
        {children}
      </body>
    </html>
  );
}
