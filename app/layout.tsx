import type { Metadata } from "next";
import { headers } from "next/headers";
import "./globals.css";

export async function generateMetadata(): Promise<Metadata> {
  const requestHeaders = await headers();
  const host =
    requestHeaders.get("x-forwarded-host") ?? requestHeaders.get("host");
  const protocol =
    requestHeaders.get("x-forwarded-proto") ??
    (host?.startsWith("localhost") ? "http" : "https");
  const baseUrl = host ? `${protocol}://${host}` : "http://localhost:3000";

  return {
    title: "HitShelf | TCG Boosters",
    description:
      "Marketplace prototype for transparent TCG booster openings with published odds, expected value, and hit pools.",
    metadataBase: new URL(baseUrl),
    openGraph: {
      title: "HitShelf | TCG Boosters",
      description:
        "Choose One Piece, Pokemon, Magic and mixed TCG boosters with visible odds and auditable hit pools.",
      images: [
        {
          url: `${baseUrl}/og.png`,
          width: 1200,
          height: 630,
          alt: "HitShelf TCG booster marketplace preview",
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title: "HitShelf | TCG Boosters",
      description: "Odds visibles. Hits auditables. Boosters TCG.",
      images: [`${baseUrl}/og.png`],
    },
    icons: {
      icon: "/favicon.svg",
      shortcut: "/favicon.svg",
    },
  };
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es">
      <body>{children}</body>
    </html>
  );
}
