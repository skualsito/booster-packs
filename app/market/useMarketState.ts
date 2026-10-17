import { useAdminOrders } from "./admin/useAdminOrders";
import { useAdminPacks } from "./admin/useAdminPacks";
import { useAdminShipments } from "./admin/useAdminShipments";
import { useAdminStock } from "./admin/useAdminStock";
import { useAdminUsersPanel } from "./admin/useAdminUsersPanel";
import { apiFetch } from "./api";
import { useRouletteAudio } from "./audio/useRouletteAudio";
import { useAuth } from "./auth/useAuth";
import { useCardSearch } from "./cards/useCardSearch";
import { useChanger } from "./changer/useChanger";
import { useCatalog } from "./home/useCatalog";
import { useNotice } from "./layout/useNotice";
import { usePackOpening } from "./pack/usePackOpening";
import { useInventory } from "./profile/useInventory";
import { useProfileForm } from "./profile/useProfileForm";
import { useWallet } from "./profile/useWallet";
import type { MarketProps } from "./types";
import { useUpgrader } from "./upgrader/useUpgrader";

// Composes every feature hook into the single object exposed through
// MarketContext. Hooks are called in dependency order.
export function useMarketState({ initialPackId, view }: MarketProps) {
  const catalog = useCatalog({ initialPackId, view });
  const {
    loadDbPacks,
    savedPacks,
    selectedPack,
    selectedPackExists,
    selectedPackId,
    setApiStatus,
    setSavedPacks,
    setSelectedPackId,
  } = catalog;

  const notice = useNotice();
  const { setWonCardsMessage, setWonCardsMessageTone } = notice;

  const profileForm = useProfileForm();
  const {
    clearProfileForm,
    fillProfileForm,
    profileAddressReference,
    profileApartment,
    profileCity,
    profileCountry,
    profileDisplayName,
    profileEmail,
    profileFloor,
    profileFullName,
    profilePassword,
    profilePhone,
    profilePostalCode,
    profileProvince,
    profileStreet,
    profileStreetNumber,
    setProfileMessage,
    setProfilePassword,
    setProfileSaving,
    setProfileSectionView,
  } = profileForm;

  const auth = useAuth({
    fillProfileForm,
    loadDbPacks,
    profileAddressReference,
    profileApartment,
    profileCity,
    profileCountry,
    profileDisplayName,
    profileEmail,
    profileFloor,
    profileFullName,
    profilePassword,
    profilePhone,
    profilePostalCode,
    profileProvince,
    profileStreet,
    profileStreetNumber,
    setApiStatus,
    setProfileMessage,
    setProfilePassword,
    setProfileSaving,
    setWonCardsMessage,
    setWonCardsMessageTone,
  });
  const {
    session,
    setAuthMessage,
    setAuthMode,
    setHomeAuthOpen,
    setSession,
    updateSessionUser,
  } = auth;

  const inventory = useInventory({
    session,
    setAuthMessage,
    setProfileSectionView,
    setWonCardsMessage,
    setWonCardsMessageTone,
    updateSessionUser,
  });
  const {
    loadWonCards,
    ownedWonCards,
    setWonCards,
    setWonCardsOpen,
  } = inventory;

  const wallet = useWallet({ session, updateSessionUser });
  const { setWalletOpen } = wallet;

  const cardSearch = useCardSearch();

  const rouletteAudio = useRouletteAudio();
  const {
    playHitFanfare,
    playRouletteTick,
    playUpgraderResultSound,
    prepareRouletteAudio,
  } = rouletteAudio;

  const upgrader = useUpgrader({
    loadWonCards,
    ownedWonCards,
    playRouletteTick,
    playUpgraderResultSound,
    prepareRouletteAudio,
    session,
    setHomeAuthOpen,
    setWonCards,
    setWonCardsMessage,
    setWonCardsMessageTone,
    view,
  });

  const changer = useChanger({
    loadWonCards,
    ownedWonCards,
    session,
    setAuthMode,
    setHomeAuthOpen,
    setWonCards,
    setWonCardsMessage,
    setWonCardsMessageTone,
    updateSessionUser,
    view,
  });

  const adminPacks = useAdminPacks({
    savedPacks,
    selectedPackId,
    session,
    setApiStatus,
    setSavedPacks,
    setSelectedPackId,
  });
  const {
    draftGame,
    packPrizeFilter,
    packStockGameFilter,
    setDraftItems,
  } = adminPacks;

  const adminStock = useAdminStock({
    draftGame,
    packPrizeFilter,
    packStockGameFilter,
    session,
    setDraftItems,
  });
  const { loadShopStock, setShopStock } = adminStock;

  const adminOrders = useAdminOrders({ session });
  const { loadShopOrders, setShopOrders } = adminOrders;

  const adminShipments = useAdminShipments({ session, view });

  const adminUsersPanel = useAdminUsersPanel({ session, view });

  const packOpening = usePackOpening({
    loadDbPacks,
    loadShopOrders,
    loadShopStock,
    loadWonCards,
    playHitFanfare,
    playRouletteTick,
    prepareRouletteAudio,
    selectedPack,
    selectedPackExists,
    session,
    setAuthMessage,
    setWonCardsMessage,
    setWonCardsMessageTone,
    updateSessionUser,
    view,
  });

  // Logging out clears state owned by several features, so it lives here.
  const logout = () => {
    if (session) {
      void apiFetch("/api/auth/logout", {
        method: "POST",
      }).catch(() => undefined);
    }

    setSession(null);
    setAuthMessage("Sesion cerrada.");
    clearProfileForm();
    setWonCards([]);
    setShopStock([]);
    setShopOrders([]);
    setWalletOpen(false);
    setWonCardsOpen(false);
  };

  return {
    initialPackId,
    view,
    ...catalog,
    ...notice,
    ...profileForm,
    ...auth,
    ...inventory,
    ...wallet,
    ...cardSearch,
    ...rouletteAudio,
    ...upgrader,
    ...changer,
    ...adminPacks,
    ...adminStock,
    ...adminOrders,
    ...adminShipments,
    ...adminUsersPanel,
    ...packOpening,
    logout,
  };
}

export type MarketState = ReturnType<typeof useMarketState>;
