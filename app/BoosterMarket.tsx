"use client";

import { ShippingModal } from "./market/admin/AdminOrdersSection";
import { AdminSection } from "./market/admin/AdminSection";
import { StockEditModal } from "./market/admin/StockEditModal";
import { AuthModal } from "./market/auth/AuthPanel";
import {
  CardsSearchSection,
  SelectedCardModal,
} from "./market/cards/CardsSearchSection";
import { ChangerSection } from "./market/changer/ChangerSection";
import { HomeView } from "./market/home/HomeSections";
import { AppHeader } from "./market/layout/AppHeader";
import { NoticeToast } from "./market/layout/NoticeToast";
import { SiteFooter } from "./market/layout/SiteFooter";
import { MarketContext } from "./market/MarketContext";
import { PackContentsSection } from "./market/pack/PackContentsSection";
import {
  MissingPackSection,
  PackOpeningSection,
} from "./market/pack/PackOpeningSection";
import { ProfileSection } from "./market/profile/ProfileSection";
import { WalletModal } from "./market/profile/WalletModal";
import { WonCardsModal } from "./market/profile/WonCardsModal";
import type { AppView } from "./market/types";
import { UpgraderSection } from "./market/upgrader/UpgraderSection";
import { useMarketState } from "./market/useMarketState";

export function BoosterMarket({
  initialPackId,
  view = "home",
}: {
  initialPackId?: string;
  view?: AppView;
}) {
  const market = useMarketState({ initialPackId, view });
  const { selectedPackExists } = market;

  const pageTransitionKey = [view, initialPackId ?? ""].join(":");

  return (
    <MarketContext.Provider value={market}>
      <main className="market-shell design-v3">
        <AppHeader />

        <div
          className={`page-transition ${
            view === "cards" ? "cards-page-transition" : ""
          }`}
          key={pageTransitionKey}
        >
          {view === "home" && <HomeView />}

          {view === "pack" &&
            (selectedPackExists ? (
              <>
                <PackOpeningSection />
                <PackContentsSection />
              </>
            ) : (
              <MissingPackSection />
            ))}
          {view === "cards" && <CardsSearchSection />}
          {view === "upgrader" && <UpgraderSection />}
          {view === "changer" && <ChangerSection />}
          {view.startsWith("admin") && <AdminSection />}
          {view === "profile" && <ProfileSection />}
          <SiteFooter />
        </div>

        <AuthModal />
        <ShippingModal />
        <StockEditModal />
        <WalletModal />
        <WonCardsModal />
        <NoticeToast />
        <SelectedCardModal />
      </main>
    </MarketContext.Provider>
  );
}
