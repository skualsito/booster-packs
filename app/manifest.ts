import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Pullario",
    short_name: "Pullario",
    description:
      "Tienda TCG para abrir cajas con probabilidades visibles e inventario de cartas.",
    start_url: "/",
    scope: "/",
    display: "standalone",
    background_color: "#0f1211",
    theme_color: "#62e6dd",
    icons: [
      {
        src: "/favicon.svg",
        sizes: "any",
        type: "image/svg+xml",
        purpose: "any maskable",
      },
    ],
  };
}
