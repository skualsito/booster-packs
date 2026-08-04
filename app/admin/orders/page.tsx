import type { Metadata } from "next";
import { BoosterMarket } from "../../BoosterMarket";

export const metadata: Metadata = {
  title: "Pedidos y reservas",
  robots: {
    index: false,
    follow: false,
  },
};

export default function AdminOrdersPage() {
  return <BoosterMarket view="admin-orders" />;
}
