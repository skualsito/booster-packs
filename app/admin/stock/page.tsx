import type { Metadata } from "next";
import { BoosterMarket } from "../../BoosterMarket";

export const metadata: Metadata = {
  title: "Gestionar stock",
  robots: {
    index: false,
    follow: false,
  },
};

export default function AdminStockPage() {
  return <BoosterMarket view="admin-stock" />;
}
