import type { Metadata } from "next";
import { BoosterMarket } from "../BoosterMarket";

export const metadata: Metadata = {
  title: "Buscador de cartas TCG",
  description:
    "Busca cartas de One Piece, Pokemon y Magic por nombre, set, numero y rareza para revisar imagenes, precios y versiones por idioma.",
  alternates: {
    canonical: "/cards",
  },
};

export default function CardsPage() {
  return <BoosterMarket view="cards" />;
}
