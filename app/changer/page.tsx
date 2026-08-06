import type { Metadata } from "next";
import { BoosterMarket } from "../BoosterMarket";

export const metadata: Metadata = {
  title: "Changer de premios TCG",
  description:
    "Cambia premios de tu inventario por otros productos TCG y recibe la diferencia de valor en tu cartera.",
  alternates: {
    canonical: "/changer",
  },
};

export default function ChangerPage() {
  return <BoosterMarket view="changer" />;
}
