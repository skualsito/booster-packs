import type { Metadata } from "next";
import { BoosterMarket } from "./BoosterMarket";

export const metadata: Metadata = {
  title: "Cajas TCG con probabilidades visibles",
  description:
    "Abrir cajas TCG de One Piece, Pokemon y Magic en Pullario con odds visibles, cartera e inventario de cartas.",
  alternates: {
    canonical: "/",
  },
};

export default function Home() {
  return <BoosterMarket view="home" />;
}
