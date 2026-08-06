import type { Metadata } from "next";
import { BoosterMarket } from "../BoosterMarket";

export const metadata: Metadata = {
  title: "Upgrader de premios TCG",
  description:
    "Combina premios de tu inventario y prueba conseguir un articulo TCG de mayor valor con probabilidades visibles.",
  alternates: {
    canonical: "/upgrader",
  },
};

export default function UpgraderPage() {
  return <BoosterMarket view="upgrader" />;
}
