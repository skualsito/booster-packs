import type { MetadataRoute } from "next";

const siteUrl = (
  process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3003"
).replace(/\/$/, "");

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: "*",
        allow: ["/", "/cards", "/packs"],
        disallow: ["/admin", "/profile", "/api"],
      },
    ],
    sitemap: `${siteUrl}/sitemap.xml`,
  };
}
