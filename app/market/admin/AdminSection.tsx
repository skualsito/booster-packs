import { useMarket } from "../MarketContext";
import { AdminDashboardSection } from "./AdminDashboardSection";
import { AdminOrdersSection } from "./AdminOrdersSection";
import { AdminPacksSection } from "./AdminPacksSection";
import { AdminShipmentsSection } from "./AdminShipmentsSection";
import { AdminStockSection } from "./AdminStockSection";
import { AdminUsersSection } from "./AdminUsersSection";

export function AdminSection() {
  const { view } = useMarket();

  return view === "admin-stock"
      ? <AdminStockSection />
      : view === "admin-packs"
        ? <AdminPacksSection />
        : view === "admin-orders"
          ? <AdminOrdersSection />
          : view === "admin-shipments"
            ? <AdminShipmentsSection />
            : view === "admin-users"
              ? <AdminUsersSection />
          : <AdminDashboardSection />;
}
