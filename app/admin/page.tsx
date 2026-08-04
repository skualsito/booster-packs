import type { Metadata } from "next";
import { BoosterMarket } from "../BoosterMarket";

export const metadata: Metadata = {
  title: "Panel administrador",
  robots: {
    index: false,
    follow: false,
  },
};

export default function AdminPage() {
  return <BoosterMarket view="admin" />;
}
