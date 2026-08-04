import type { Metadata } from "next";
import { BoosterMarket } from "../BoosterMarket";

export const metadata: Metadata = {
  title: "Perfil",
  robots: {
    index: false,
    follow: false,
  },
};

export default function ProfilePage() {
  return <BoosterMarket view="profile" />;
}
