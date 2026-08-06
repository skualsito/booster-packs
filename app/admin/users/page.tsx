import type { Metadata } from "next";
import { BoosterMarket } from "../../BoosterMarket";

export const metadata: Metadata = {
  title: "Inventarios de usuarios",
  robots: {
    index: false,
    follow: false,
  },
};

export default function AdminUsersPage() {
  return <BoosterMarket view="admin-users" />;
}
