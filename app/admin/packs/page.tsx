import type { Metadata } from "next";
import { BoosterMarket } from "../../BoosterMarket";

export const metadata: Metadata = {
  title: "Crear cajas",
  robots: {
    index: false,
    follow: false,
  },
};

export default function AdminPacksPage() {
  return <BoosterMarket view="admin-packs" />;
}
