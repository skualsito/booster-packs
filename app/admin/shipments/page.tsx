import type { Metadata } from "next";
import { BoosterMarket } from "../../BoosterMarket";

export const metadata: Metadata = {
  title: "Envios activos",
  robots: {
    index: false,
    follow: false,
  },
};

export default function AdminShipmentsPage() {
  return <BoosterMarket view="admin-shipments" />;
}
