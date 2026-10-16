import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import type { CardGame, ExternalCard, PrizeItemType } from "../lib/card-search";
import { apiFetch, authHeader, clearStoredSession } from "./api";
import { useRouletteAudio } from "./audio/useRouletteAudio";
import { useAuth } from "./auth/useAuth";
import { useCardSearch } from "./cards/useCardSearch";
import {
  cardGames,
  gameAccents,
  isSellerRole,
  itemTypeOf,
  prizeItemTypes,
  prizeTypeLabels,
} from "./catalog";
import { useChanger } from "./changer/useChanger";
import { HIT_PROBABILITY_THRESHOLD, ROULETTE_STRIDE } from "./constants";
import { demoPacks } from "./demo-packs";
import { useCatalog } from "./home/useCatalog";
import { useNotice } from "./layout/useNotice";
import {
  normalizedProbability,
  normalizeItems,
  packExpectedValue,
  weightedPick,
} from "./pack-math";
import { useInventory } from "./profile/useInventory";
import { useProfileForm } from "./profile/useProfileForm";
import { useWallet } from "./profile/useWallet";
import type {
  AdminUserCardsResponse,
  AdminUsersResponse,
  AdminUserSummary,
  ApiStatus,
  BoosterPack,
  DeliverShipmentResponse,
  MarketProps,
  OpenPackResponse,
  PackGame,
  PackItem,
  RecentDrop,
  RecentDropsResponse,
  RouletteState,
  SavePackResponse,
  ShipOrdersResponse,
  ShopOrderItem,
  ShopOrdersResponse,
  ShopShipmentsResponse,
  ShopStockItem,
  ShopStockResponse,
  UserCardItem,
} from "./types";
import { useUpgrader } from "./upgrader/useUpgrader";

export function useMarketState({ initialPackId, view }: MarketProps) {
  const catalog = useCatalog({ initialPackId, view });
  const {
    activePackId,
    apiStatus,
    heroShowcaseItems,
    loadDbPacks,
    packs,
    savedPacks,
    selectedPack,
    selectedPackExists,
    selectedPackId,
    selectedTopItem,
    setApiStatus,
    setSavedPacks,
    setSelectedPackId,
  } = catalog;
  const notice = useNotice();
  const {
    setWonCardsMessage,
    setWonCardsMessageTone,
    wonCardsMessage,
    wonCardsMessageTone,
  } = notice;
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
    profileMessage,
    profilePassword,
    profilePhone,
    profilePostalCode,
    profileProvince,
    profileSaving,
    profileSectionView,
    profileStreet,
    profileStreetNumber,
    setProfileAddressReference,
    setProfileApartment,
    setProfileCity,
    setProfileCountry,
    setProfileDisplayName,
    setProfileEmail,
    setProfileFloor,
    setProfileFullName,
    setProfileMessage,
    setProfilePassword,
    setProfilePhone,
    setProfilePostalCode,
    setProfileProvince,
    setProfileSaving,
    setProfileSectionView,
    setProfileStreet,
    setProfileStreetNumber,
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
    authMessage,
    authMode,
    homeAuthOpen,
    loginEmail,
    loginPassword,
    loginUsername,
    session,
    setAuthMessage,
    setAuthMode,
    setHomeAuthOpen,
    setLoginEmail,
    setLoginPassword,
    setLoginUsername,
    setSession,
    storeSession,
    submitAuth,
    updateProfile,
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
    inventoryActiveOnly,
    inventoryPriceSort,
    loadWonCards,
    ownedWonCards,
    ownedWonCardsValue,
    profilePrizeView,
    sellWonCard,
    setInventoryActiveOnly,
    setInventoryPriceSort,
    setProfilePrizeView,
    setWonCardBusyId,
    setWonCards,
    setWonCardsOpen,
    userWithdrawalGroups,
    visibleInventoryCards,
    withdrawWonCard,
    wonCardBusyId,
    wonCards,
    wonCardsOpen,
  } = inventory;
  const wallet = useWallet({ session, updateSessionUser });
  const {
    setWalletAmount,
    setWalletMessage,
    setWalletOpen,
    setWalletSaving,
    topUpWallet,
    walletAmount,
    walletMessage,
    walletOpen,
    walletSaving,
  } = wallet;
  const cardSearch = useCardSearch();
  const {
    adminSearch,
    publicSearch,
    runSearch,
    selectedCard,
    setAdminSearch,
    setPublicSearch,
    setSelectedCard,
    showCardDetails,
  } = cardSearch;
  const rouletteAudio = useRouletteAudio();
  const {
    audioContextRef,
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
  const {
    chooseUpgraderPreset,
    effectiveUpgraderMaxPrice,
    effectiveUpgraderMinPrice,
    filteredUpgraderTargets,
    loadUpgraderOptions,
    parsedUpgraderMaxPrice,
    parsedUpgraderMinPrice,
    playUpgrader,
    setUpgraderGame,
    setUpgraderLoading,
    setUpgraderMaxPrice,
    setUpgraderMinPrice,
    setUpgraderOutcome,
    setUpgraderPlaying,
    setUpgraderPreset,
    setUpgraderQuery,
    setUpgraderRotation,
    setUpgraderStakeIds,
    setUpgraderTargetId,
    setUpgraderTargetQuantity,
    setUpgraderTargets,
    startUpgraderTickTracking,
    toggleUpgraderStake,
    upgraderChance,
    upgraderGame,
    upgraderLoading,
    upgraderMaxPrice,
    upgraderMinPrice,
    upgraderMultiplier,
    upgraderNeedleRef,
    upgraderOutcome,
    upgraderPlaying,
    upgraderPreset,
    upgraderQuery,
    upgraderRotation,
    upgraderStakeCards,
    upgraderStakeIds,
    upgraderStakeValue,
    upgraderTarget,
    upgraderTargetId,
    upgraderTargetMaxQuantity,
    upgraderTargetQuantity,
    upgraderTargets,
    upgraderTargetValue,
    upgraderTickFrameRef,
    upgraderTimerRef,
  } = upgrader;
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
  const {
    addChangerTarget,
    changerGame,
    changerLoading,
    changerOutcome,
    changerQuery,
    changerRefund,
    changerSaving,
    changerSelectedTargets,
    changerStakeCards,
    changerStakeIds,
    changerStakeValue,
    changerTargetQuantities,
    changerTargets,
    changerTargetUnits,
    changerTargetValue,
    filteredChangerTargets,
    loadChangerOptions,
    playChanger,
    removeChangerTarget,
    setChangerGame,
    setChangerLoading,
    setChangerOutcome,
    setChangerQuery,
    setChangerSaving,
    setChangerStakeIds,
    setChangerTargetQuantities,
    setChangerTargets,
    toggleChangerStake,
  } = changer;
  const [adminMessage, setAdminMessage] = useState("");
  const [adminSaving, setAdminSaving] = useState(false);
  const [shopStock, setShopStock] = useState<ShopStockItem[]>([]);
  const [stockMessage, setStockMessage] = useState("");
  const [stockBusyId, setStockBusyId] = useState<number | null>(null);
  const [stockEditor, setStockEditor] = useState<ShopStockItem | null>(null);
  const [stockEditPrice, setStockEditPrice] = useState("");
  const [stockEditImageUrl, setStockEditImageUrl] = useState("");
  const [stockEditError, setStockEditError] = useState("");
  const [stockEditSaving, setStockEditSaving] = useState(false);
  const [stockQuantityDrafts, setStockQuantityDrafts] = useState<
    Record<number, string>
  >({});
  const [stockGameFilter, setStockGameFilter] = useState<PackGame>("mixed");
  const [stockPrizeFilter, setStockPrizeFilter] = useState<PrizeItemType | "all">(
    "all",
  );
  const [packStockGameFilter, setPackStockGameFilter] =
    useState<PackGame>("mixed");
  const [packPrizeFilter, setPackPrizeFilter] = useState<PrizeItemType | "all">(
    "all",
  );
  const [sealedType, setSealedType] = useState<Exclude<PrizeItemType, "card">>(
    "sealed-pack",
  );
  const [sealedGame, setSealedGame] = useState<CardGame>("one-piece");
  const [sealedName, setSealedName] = useState("");
  const [sealedSetName, setSealedSetName] = useState("");
  const [sealedPrice, setSealedPrice] = useState(0);
  const [sealedImageUrl, setSealedImageUrl] = useState("");
  const [sealedQuantity, setSealedQuantity] = useState(1);
  const [sealedQuery, setSealedQuery] = useState("");
  const [sealedResults, setSealedResults] = useState<ExternalCard[]>([]);
  const [sealedSearchLoading, setSealedSearchLoading] = useState(false);
  const [sealedSearchError, setSealedSearchError] = useState("");
  const [manualSealedOpen, setManualSealedOpen] = useState(false);
  const [shopOrders, setShopOrders] = useState<ShopOrderItem[]>([]);
  const [ordersMessage, setOrdersMessage] = useState("");
  const [selectedShipmentIds, setSelectedShipmentIds] = useState<number[]>([]);
  const [shippingModalOpen, setShippingModalOpen] = useState(false);
  const [shipmentTrackingNumber, setShipmentTrackingNumber] = useState("");
  const [shippingOrders, setShippingOrders] = useState(false);
  const [activeShipments, setActiveShipments] = useState<ShopOrderItem[]>([]);
  const [shipmentHistory, setShipmentHistory] = useState<ShopOrderItem[]>([]);
  const [shipmentView, setShipmentView] = useState<"active" | "history">(
    "active",
  );
  const [shipmentsMessage, setShipmentsMessage] = useState("");
  const [shipmentBusyKey, setShipmentBusyKey] = useState<string | null>(null);
  const [adminUsers, setAdminUsers] = useState<AdminUserSummary[]>([]);
  const [adminUserQuery, setAdminUserQuery] = useState("");
  const [selectedAdminUser, setSelectedAdminUser] =
    useState<AdminUserSummary | null>(null);
  const [adminUserCards, setAdminUserCards] = useState<UserCardItem[]>([]);
  const [adminUsersMessage, setAdminUsersMessage] = useState("");
  const [adminUsersLoading, setAdminUsersLoading] = useState(false);
  const [adminInventoryActiveOnly, setAdminInventoryActiveOnly] =
    useState(false);
  const [adminInventoryMinPrice, setAdminInventoryMinPrice] = useState("");
  const [adminInventoryMaxPrice, setAdminInventoryMaxPrice] = useState("");
  const [adminInventorySort, setAdminInventorySort] = useState<
    "price-desc" | "price-asc" | "date-desc" | "date-asc"
  >("date-desc");
  const [adminUserView, setAdminUserView] = useState<
    "inventory" | "shipments"
  >("inventory");
  const [editingPackId, setEditingPackId] = useState<string | null>(null);
  const [draftName, setDraftName] = useState("Caja personalizada");
  const [draftSeries, setDraftSeries] = useState("Mi serie local");
  const [draftGame, setDraftGame] = useState<PackGame>("mixed");
  const [draftPrice, setDraftPrice] = useState(20);
  const [draftItems, setDraftItems] = useState<PackItem[]>([]);
  const [draftPriceSort, setDraftPriceSort] = useState<
    "price-desc" | "price-asc"
  >("price-desc");
  const [recentDrops, setRecentDrops] = useState<RecentDrop[]>([]);
  const [recentDropsLoading, setRecentDropsLoading] = useState(false);
  const [openingPack, setOpeningPack] = useState(false);
  const [roulette, setRoulette] = useState<RouletteState>({
    items: [],
    targetIndex: 0,
    offset: 0,
    phase: "idle",
    runId: 0,
  });
  const [celebratingRunId, setCelebratingRunId] = useState<number | null>(null);
  const spinTimers = useRef<number[]>([]);
  const rouletteTrackRef = useRef<HTMLDivElement | null>(null);
  const rouletteTickFrameRef = useRef<number | null>(null);

  const loadShopStock = useCallback(async () => {
    if (!session || !isSellerRole(session.role)) {
      return [];
    }

    try {
      const response = await apiFetch("/api/admin/stock", {
        headers: {
          ...authHeader(session),
        },
      });
      const payload = (await response.json()) as ShopStockResponse;

      if (!response.ok || payload.error || !Array.isArray(payload.stock)) {
        throw new Error(payload.error ?? "No se pudo leer el stock.");
      }

      setShopStock(payload.stock);
      setStockMessage("");
      return payload.stock;
    } catch (error) {
      setStockMessage(
        error instanceof Error ? error.message : "No se pudo leer el stock.",
      );
      return [];
    }
  }, [session]);

  const loadShopOrders = useCallback(async () => {
    if (!session || !isSellerRole(session.role)) {
      return [];
    }

    try {
      const response = await apiFetch("/api/admin/orders", {
        headers: {
          ...authHeader(session),
        },
      });
      const payload = (await response.json()) as ShopOrdersResponse;

      if (!response.ok || payload.error || !Array.isArray(payload.orders)) {
        throw new Error(payload.error ?? "No se pudieron leer los pedidos.");
      }

      setShopOrders(payload.orders);
      setOrdersMessage("");
      const activeOrderIds = new Set(payload.orders.map((order) => order.id));
      setSelectedShipmentIds((current) =>
        current.filter((orderId) => activeOrderIds.has(orderId)),
      );
      return payload.orders;
    } catch (error) {
      setOrdersMessage(
        error instanceof Error
          ? error.message
          : "No se pudieron leer los pedidos.",
      );
      return [];
    }
  }, [session]);

  const toggleShipmentSelection = (orderId: number) => {
    const targetOrder = shopOrders.find((order) => order.id === orderId);

    if (!targetOrder) {
      return;
    }

    setSelectedShipmentIds((current) => {
      if (current.includes(orderId)) {
        return current.filter((id) => id !== orderId);
      }

      const selectedUserId = shopOrders.find(
        (order) => order.id === current[0],
      )?.userId;

      return selectedUserId && selectedUserId !== targetOrder.userId
        ? [orderId]
        : [...current, orderId];
    });
  };

  const markSelectedOrdersShipped = async () => {
    if (
      !session ||
      !isSellerRole(session.role) ||
      !selectedShipmentsReady ||
      shipmentTrackingNumber.trim().length < 3
    ) {
      return;
    }

    setShippingOrders(true);
    setOrdersMessage("");

    try {
      const response = await apiFetch("/api/admin/orders/ship", {
        method: "POST",
        headers: {
          ...authHeader(session),
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          shipments: selectedShipmentIds.map((id) => ({
            id,
            trackingNumber: shipmentTrackingNumber.trim(),
          })),
        }),
      });
      const payload = (await response.json()) as ShipOrdersResponse;

      if (!response.ok || payload.error || !payload.ok) {
        throw new Error(payload.error ?? "No se pudieron confirmar los envios.");
      }

      const shippedCount = payload.shippedCount ?? selectedShipmentIds.length;
      setSelectedShipmentIds([]);
      setShipmentTrackingNumber("");
      setShippingModalOpen(false);
      await loadShopOrders();
      setOrdersMessage(
        `${shippedCount} ${shippedCount === 1 ? "retiro marcado" : "retiros marcados"} como enviado.`,
      );
    } catch (error) {
      setOrdersMessage(
        error instanceof Error
          ? error.message
          : "No se pudieron confirmar los envios.",
      );
    } finally {
      setShippingOrders(false);
    }
  };

  const loadShopShipments = useCallback(async () => {
    if (!session || !isSellerRole(session.role)) {
      return;
    }

    try {
      const response = await apiFetch("/api/admin/shipments", {
        headers: { ...authHeader(session) },
      });
      const payload = (await response.json()) as ShopShipmentsResponse;

      if (
        !response.ok ||
        payload.error ||
        !Array.isArray(payload.active) ||
        !Array.isArray(payload.history)
      ) {
        throw new Error(payload.error ?? "No se pudieron leer los envios.");
      }

      setActiveShipments(payload.active);
      setShipmentHistory(payload.history);
      setShipmentsMessage("");
    } catch (error) {
      setShipmentsMessage(
        error instanceof Error ? error.message : "No se pudieron leer los envios.",
      );
    }
  }, [session]);

  const markShipmentReceived = async (ids: number[], shipmentKey: string) => {
    if (!session || !isSellerRole(session.role) || !ids.length) {
      return;
    }

    setShipmentBusyKey(shipmentKey);
    setShipmentsMessage("");

    try {
      const response = await apiFetch("/api/admin/shipments/deliver", {
        method: "POST",
        headers: {
          ...authHeader(session),
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ ids }),
      });
      const payload = (await response.json()) as DeliverShipmentResponse;

      if (!response.ok || payload.error || !payload.ok) {
        throw new Error(payload.error ?? "No se pudo confirmar la entrega.");
      }

      await loadShopShipments();
      setShipmentsMessage("Entrega confirmada y guardada en el historial.");
    } catch (error) {
      setShipmentsMessage(
        error instanceof Error ? error.message : "No se pudo confirmar la entrega.",
      );
    } finally {
      setShipmentBusyKey(null);
    }
  };

  const loadAdminUsers = useCallback(
    async (query = "") => {
      if (!session || !isSellerRole(session.role)) {
        return;
      }

      setAdminUsersLoading(true);
      setAdminUsersMessage("");

      try {
        const params = new URLSearchParams({ query: query.trim() });
        const response = await apiFetch(
          `/api/admin/users?${params.toString()}`,
          { headers: { ...authHeader(session) } },
        );
        const payload = (await response.json()) as AdminUsersResponse;

        if (!response.ok || payload.error || !Array.isArray(payload.users)) {
          throw new Error(payload.error ?? "No se pudieron leer los usuarios.");
        }

        const normalizedUsers = payload.users.map((user) => ({
          ...user,
          spentValueUsd: Number.isFinite(Number(user.spentValueUsd))
            ? Number(user.spentValueUsd)
            : 0,
          withdrawnValueUsd: Number.isFinite(Number(user.withdrawnValueUsd))
            ? Number(user.withdrawnValueUsd)
            : 0,
        }));

        setAdminUsers(normalizedUsers);
        setSelectedAdminUser((currentUser) => {
          if (!currentUser) {
            return null;
          }

          return (
            normalizedUsers.find((user) => user.id === currentUser.id) ??
            currentUser
          );
        });
      } catch (error) {
        setAdminUsersMessage(
          error instanceof Error
            ? error.message
            : "No se pudieron leer los usuarios.",
        );
      } finally {
        setAdminUsersLoading(false);
      }
    },
    [session],
  );

  const loadAdminUserCards = async (user: AdminUserSummary) => {
    if (!session || !isSellerRole(session.role)) {
      return;
    }

    setSelectedAdminUser(user);
    setAdminUserCards([]);
    setAdminUsersLoading(true);
    setAdminUsersMessage("");

    try {
      const response = await apiFetch(
        `/api/admin/users/${encodeURIComponent(user.id)}/cards`,
        { headers: { ...authHeader(session) } },
      );
      const payload = (await response.json()) as AdminUserCardsResponse;

      if (!response.ok || payload.error || !Array.isArray(payload.cards)) {
        throw new Error(payload.error ?? "No se pudo leer el inventario.");
      }

      setAdminUserCards(payload.cards);
    } catch (error) {
      setAdminUsersMessage(
        error instanceof Error ? error.message : "No se pudo leer el inventario.",
      );
    } finally {
      setAdminUsersLoading(false);
    }
  };

  const loadRecentDrops = useCallback(async (packId: string) => {
    if (!packId.trim()) {
      setRecentDrops([]);
      return [];
    }

    setRecentDropsLoading(true);

    try {
      const params = new URLSearchParams({ packId, limit: "12" });
      const response = await apiFetch(`/api/drops?${params.toString()}`);
      const payload = (await response.json()) as RecentDropsResponse;

      if (!response.ok || payload.error) {
        throw new Error(payload.error ?? "No se pudieron leer las caidas.");
      }

      setRecentDrops(payload.drops ?? []);
      return payload.drops ?? [];
    } catch {
      setRecentDrops([]);
      return [];
    } finally {
      setRecentDropsLoading(false);
    }
  }, []);

  useEffect(() => {
    if (!isSellerRole(session?.role)) {
      return;
    }

    const timer = window.setTimeout(() => {
      void loadShopStock();
    }, 0);

    return () => window.clearTimeout(timer);
  }, [loadShopStock, session?.role]);

  useEffect(() => {
    if (!isSellerRole(session?.role)) {
      return;
    }

    const timer = window.setTimeout(() => {
      void loadShopOrders();
    }, 0);

    return () => window.clearTimeout(timer);
  }, [loadShopOrders, session?.role]);

  useEffect(() => {
    if (
      !isSellerRole(session?.role) ||
      (view !== "admin-shipments" && view !== "admin")
    ) {
      return;
    }

    const timer = window.setTimeout(() => {
      void loadShopShipments();
    }, 0);

    return () => window.clearTimeout(timer);
  }, [loadShopShipments, session?.role, view]);

  useEffect(() => {
    if (
      !isSellerRole(session?.role) ||
      (view !== "admin-users" && view !== "admin")
    ) {
      return;
    }

    const timer = window.setTimeout(() => {
      void loadAdminUsers();
    }, 0);

    return () => window.clearTimeout(timer);
  }, [loadAdminUsers, session?.role, view]);

  useEffect(() => {
    return () => {
      spinTimers.current.forEach((timer) => window.clearTimeout(timer));
      if (rouletteTickFrameRef.current !== null) {
        window.cancelAnimationFrame(rouletteTickFrameRef.current);
      }
    };
  }, []);
  const sellerPacks = isSellerRole(session?.role) ? savedPacks : [];
  const rouletteBelongsToSelectedPack = roulette.packId === selectedPack.id;
  const visibleRouletteItems = rouletteBelongsToSelectedPack ? roulette.items : [];
  const visibleRouletteOffset = rouletteBelongsToSelectedPack ? roulette.offset : 0;
  const visibleRoulettePhase = rouletteBelongsToSelectedPack
    ? roulette.phase
    : "idle";
  const visibleRouletteResult = rouletteBelongsToSelectedPack
    ? roulette.result
    : undefined;
  const visibleRouletteRunId = rouletteBelongsToSelectedPack
    ? roulette.runId
    : 0;
  useEffect(() => {
    if (selectedPack.createdBy === "demo") {
      // Pre-existing reset-on-change effect, kept as is by the refactor.
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setRecentDrops([]);
      return;
    }

    const timer = window.setTimeout(() => {
      void loadRecentDrops(selectedPack.id);
    }, 0);

    return () => window.clearTimeout(timer);
  }, [loadRecentDrops, selectedPack.createdBy, selectedPack.id]);

  const idleRouletteItems = useMemo(() => {
    if (!selectedPack.items.length) {
      return [];
    }

    const seed = Array.from(selectedPack.id).reduce(
      (total, character) => total + character.charCodeAt(0),
      0,
    );
    const orderedItems = [...selectedPack.items].sort((first, second) => {
      const firstScore = Array.from(`${first.slotId}-${seed}`).reduce(
        (total, character) => (total * 31 + character.charCodeAt(0)) % 2147483647,
        7,
      );
      const secondScore = Array.from(`${second.slotId}-${seed}`).reduce(
        (total, character) => (total * 31 + character.charCodeAt(0)) % 2147483647,
        7,
      );

      return firstScore - secondScore;
    });
    const previewLength = Math.max(10, orderedItems.length);
    const previewItems = Array.from({ length: previewLength }, (_, index) =>
      index < orderedItems.length
        ? orderedItems[index]
        : orderedItems[(seed + index * 7) % orderedItems.length],
    );

    return previewItems.map((item, index) => ({
      ...item,
      spinKey: `idle-${selectedPack.id}-${index}`,
    }));
  }, [selectedPack]);
  const draftProbabilityTotal = draftItems.reduce(
    (total, item) => total + Math.max(0, item.probability),
    0,
  );
  const draftExpectedValue = packExpectedValue({ items: draftItems });
  const draftMargin = draftPrice - draftExpectedValue;
  const sortedDraftItems = [...draftItems].sort((left, right) => {
    const leftPrice = left.card.priceUsd ?? 0;
    const rightPrice = right.card.priceUsd ?? 0;

    return draftPriceSort === "price-desc"
      ? rightPrice - leftPrice
      : leftPrice - rightPrice;
  });
  const withdrawnOrderCount = shopOrders.filter(
    (item) => item.status === "withdrawn",
  ).length;
  const filteredShopStock = shopStock.filter((item) => {
    const gameMatches =
      stockGameFilter === "mixed" || item.card.game === stockGameFilter;
    const typeMatches =
      stockPrizeFilter === "all" || itemTypeOf(item.card) === stockPrizeFilter;

    return gameMatches && typeMatches;
  });
  const packBuilderStock = shopStock.filter((item) => {
    if (item.quantity <= 0) {
      return false;
    }

    const gameMatches =
      draftGame === "mixed" || item.card.game === draftGame;
    const filterMatches =
      packStockGameFilter === "mixed" ||
      item.card.game === packStockGameFilter;
    const typeMatches =
      packPrizeFilter === "all" || itemTypeOf(item.card) === packPrizeFilter;

    return gameMatches && filterMatches && typeMatches;
  }).sort(
    (left, right) =>
      (right.card.priceUsd ?? 0) - (left.card.priceUsd ?? 0),
  );
  const groupedShopOrders = Object.values(
    shopOrders.reduce<
      Record<
        string,
        {
          userId: number;
          username: string;
          displayName?: string;
          orders: ShopOrderItem[];
        }
      >
    >((groups, order) => {
      const key = String(order.userId);
      const group = groups[key] ?? {
        userId: order.userId,
        username: order.username,
        displayName: order.displayName,
        orders: [],
      };

      group.orders.push(order);
      groups[key] = group;
      return groups;
    }, {}),
  ).sort((left, right) =>
    (left.displayName || left.username).localeCompare(
      right.displayName || right.username,
    ),
  );
  const selectedShipmentsReady = selectedShipmentIds.length > 0;
  const selectedShipmentUserId = shopOrders.find(
    (order) => order.id === selectedShipmentIds[0],
  )?.userId;
  const groupShipmentItems = (items: ShopOrderItem[]) =>
    Object.values(
      items.reduce<
        Record<
          string,
          {
            key: string;
            userId: number;
            username: string;
            displayName?: string;
            trackingNumber: string;
            shippedAt?: string;
            deliveredAt?: string;
            items: ShopOrderItem[];
          }
        >
      >((groups, item) => {
        const trackingNumber = item.trackingNumber || "Sin seguimiento";
        const key = `${item.userId}:${trackingNumber}`;
        const group = groups[key] ?? {
          key,
          userId: item.userId,
          username: item.username,
          displayName: item.displayName,
          trackingNumber,
          shippedAt: item.shippedAt,
          deliveredAt: item.deliveredAt,
          items: [],
        };

        group.items.push(item);
        groups[key] = group;
        return groups;
      }, {}),
    );
  const activeShipmentGroups = groupShipmentItems(activeShipments);
  const shipmentHistoryGroups = groupShipmentItems(shipmentHistory);
  const minAdminPrice = Number(adminInventoryMinPrice);
  const maxAdminPrice = Number(adminInventoryMaxPrice);
  const visibleAdminUserCards = adminUserCards
    .filter((item) => {
      const activeMatches =
        !adminInventoryActiveOnly ||
        item.status === "owned" ||
        item.status === "waiting_stock";
      const minMatches =
        !adminInventoryMinPrice.trim() ||
        (Number.isFinite(minAdminPrice) && item.valueUsd >= minAdminPrice);
      const maxMatches =
        !adminInventoryMaxPrice.trim() ||
        (Number.isFinite(maxAdminPrice) && item.valueUsd <= maxAdminPrice);

      return activeMatches && minMatches && maxMatches;
    })
    .sort((left, right) => {
      if (adminInventorySort === "price-desc") {
        return right.valueUsd - left.valueUsd;
      }
      if (adminInventorySort === "price-asc") {
        return left.valueUsd - right.valueUsd;
      }

      const leftDate = new Date(left.acquiredAt ?? 0).getTime();
      const rightDate = new Date(right.acquiredAt ?? 0).getTime();
      return adminInventorySort === "date-desc"
        ? rightDate - leftDate
        : leftDate - rightDate;
    });
  const adminUserWithdrawalGroups = Object.values(
    adminUserCards
      .filter((item) => item.status === "withdrawn")
      .reduce<
        Record<
          string,
          {
            key: string;
            trackingNumber?: string;
            shipmentStatus: "pending" | "shipped" | "delivered";
            shippedAt?: string;
            deliveredAt?: string;
            items: UserCardItem[];
          }
        >
      >((groups, item) => {
        const shipmentStatus = item.shipmentStatus ?? "pending";
        const key = item.trackingNumber
          ? `tracking:${item.trackingNumber}`
          : `pending:${shipmentStatus}`;
        const group = groups[key] ?? {
          key,
          trackingNumber: item.trackingNumber,
          shipmentStatus,
          shippedAt: item.shippedAt,
          deliveredAt: item.deliveredAt,
          items: [],
        };

        group.items.push(item);
        groups[key] = group;
        return groups;
      }, {}),
  ).sort((left, right) => {
    const leftDate = new Date(
      left.deliveredAt ?? left.shippedAt ?? left.items[0]?.acquiredAt ?? 0,
    ).getTime();
    const rightDate = new Date(
      right.deliveredAt ?? right.shippedAt ?? right.items[0]?.acquiredAt ?? 0,
    ).getTime();
    return rightDate - leftDate;
  });
  const stockCountsByGame = cardGames.reduce(
    (counts, game) => ({
      ...counts,
      [game]: shopStock.filter((item) => item.card.game === game).length,
    }),
    {} as Record<CardGame, number>,
  );
  const stockCountsByType = prizeItemTypes.reduce(
    (counts, itemType) => ({
      ...counts,
      [itemType]: shopStock.filter(
        (item) => itemTypeOf(item.card) === itemType,
      ).length,
    }),
    {} as Record<PrizeItemType, number>,
  );
  const stockQuantityForCard = (card: ExternalCard) =>
    shopStock.find(
      (item) =>
        item.card.id === card.id &&
        item.card.game === card.game &&
        itemTypeOf(item.card) === itemTypeOf(card),
    )
      ?.quantity ?? 0;

  const logout = () => {
    if (session) {
      void apiFetch("/api/auth/logout", {
        method: "POST",
        headers: {
          ...authHeader(session),
        },
      }).catch(() => undefined);
    }

    setSession(null);
    clearStoredSession();
    setAuthMessage("Sesion cerrada.");
    clearProfileForm();
    setWonCards([]);
    setShopStock([]);
    setShopOrders([]);
    setWalletOpen(false);
    setWonCardsOpen(false);
  };

  const addCardToDraft = (card: ExternalCard) => {
    setDraftItems((current) => {
      if (
        current.some(
          (item) =>
            item.card.id === card.id &&
            item.card.game === card.game &&
            itemTypeOf(item.card) === itemTypeOf(card),
        )
      ) {
        return current;
      }

      const nextProbability = current.length ? 5 : 100;
      return [
        ...current,
        {
          slotId: `${card.game}-${card.id}-${crypto.randomUUID()}`,
          card,
          probability: nextProbability,
        },
      ];
    });
  };

  const updateDraftProbability = (slotId: string, value: number) => {
    setDraftItems((current) =>
      current.map((item) =>
        item.slotId === slotId
          ? { ...item, probability: Number(Math.max(0, value).toFixed(3)) }
          : item,
      ),
    );
  };

  const removeDraftItem = (slotId: string) => {
    setDraftItems((current) => current.filter((item) => item.slotId !== slotId));
  };

  const addCardToStock = async (card: ExternalCard, quantity = 1) => {
    if (!session || !isSellerRole(session.role)) {
      setStockMessage("Inicia sesion como administrador para cargar stock.");
      return false;
    }

    setStockMessage("");

    try {
      const response = await apiFetch("/api/admin/stock", {
        method: "POST",
        headers: {
          ...authHeader(session),
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ card, quantity }),
      });
      const payload = (await response.json()) as ShopStockResponse;

      if (
        !response.ok ||
        payload.error ||
        !payload.stock ||
        Array.isArray(payload.stock)
      ) {
        throw new Error(payload.error ?? "No se pudo sumar al stock.");
      }

      setShopStock((current) => [
        payload.stock as ShopStockItem,
        ...current.filter((item) => item.id !== (payload.stock as ShopStockItem).id),
      ]);
      setStockMessage(`${card.name} sumado al stock.`);
      return true;
    } catch (error) {
      setStockMessage(
        error instanceof Error ? error.message : "No se pudo sumar al stock.",
      );
      return false;
    }
  };

  const addSealedProductToStock = async () => {
    const name = sealedName.trim();
    const setName = sealedSetName.trim();

    if (!name || !setName || sealedPrice <= 0 || sealedQuantity < 1) {
      setStockMessage(
        "Completa nombre, expansion, precio y cantidad del producto sellado.",
      );
      return;
    }

    const product: ExternalCard = {
      id: `${sealedType}-${crypto.randomUUID()}`,
      game: sealedGame,
      itemType: sealedType,
      name,
      setName,
      rarity: prizeTypeLabels[sealedType],
      imageUrl: sealedImageUrl.trim() || undefined,
      priceUsd: Number(Math.max(0, sealedPrice).toFixed(2)),
      priceSource: "Precio manual de Pullario",
      updatedAt: new Date().toISOString().slice(0, 10),
    };

    const added = await addCardToStock(product, Math.floor(sealedQuantity));

    if (!added) {
      return;
    }

    setSealedName("");
    setSealedSetName("");
    setSealedPrice(0);
    setManualSealedOpen(true);
    setSealedImageUrl("");
    setSealedQuantity(1);
  };

  const searchSealedProducts = async () => {
    const query = sealedQuery.trim();

    if (query.length < 2) {
      setSealedSearchError("Escribi una expansion o producto.");
      setSealedResults([]);
      return;
    }

    setSealedSearchLoading(true);
    setSealedSearchError("");
    setSealedResults([]);

    try {
      const params = new URLSearchParams({ game: sealedGame, q: query });
      const response = await fetch(`/api/sealed/search?${params.toString()}`);
      const payload = (await response.json()) as {
        products?: ExternalCard[];
        error?: string;
      };

      if (!response.ok || payload.error) {
        throw new Error(payload.error ?? "No se pudieron buscar productos.");
      }

      setSealedResults(payload.products ?? []);
      if (!payload.products?.length) {
        setSealedSearchError(
          "No encontramos sobres o cajas con esa busqueda. Podes cargarlos manualmente.",
        );
      }
    } catch (error) {
      setSealedSearchError(
        error instanceof Error
          ? error.message
          : "No se pudieron buscar productos sellados.",
      );
    } finally {
      setSealedSearchLoading(false);
    }
  };

  const selectSealedSearchResult = async (product: ExternalCard) => {
    if (typeof product.priceUsd === "number" && product.priceUsd > 0) {
      await addCardToStock(product, 1);
      return;
    }

    setSealedType(
      itemTypeOf(product) === "sealed-box" ? "sealed-box" : "sealed-pack",
    );
    setSealedGame(product.game);
    setSealedName(product.name);
    setSealedSetName(product.setName);
    setSealedImageUrl(product.imageUrl ?? "");
    setSealedPrice(0);
    setStockMessage(
      `${product.name} no tiene precio de mercado. Completa el precio en la carga manual.`,
    );
  };

  const updateStockQuantity = async (
    stockItem: ShopStockItem,
    quantity: number,
  ) => {
    if (!session || !isSellerRole(session.role)) {
      return;
    }

    setStockBusyId(stockItem.id);
    setStockMessage("");

    try {
      const response = await apiFetch(
        `/api/admin/stock/${encodeURIComponent(stockItem.id)}`,
        {
          method: "PUT",
          headers: {
            ...authHeader(session),
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ quantity }),
        },
      );
      const payload = (await response.json()) as ShopStockResponse;

      if (!response.ok || payload.error) {
        throw new Error(payload.error ?? "No se pudo actualizar el stock.");
      }

      if (payload.deleted) {
        setShopStock((current) =>
          current.filter((item) => item.id !== stockItem.id),
        );
      } else if (payload.stock && !Array.isArray(payload.stock)) {
        setShopStock((current) =>
          current.map((item) =>
            item.id === stockItem.id ? (payload.stock as ShopStockItem) : item,
          ),
        );
      }
      setStockQuantityDrafts((current) => {
        const next = { ...current };
        delete next[stockItem.id];
        return next;
      });
    } catch (error) {
      setStockQuantityDrafts((current) => {
        const next = { ...current };
        delete next[stockItem.id];
        return next;
      });
      setStockMessage(
        error instanceof Error ? error.message : "No se pudo actualizar el stock.",
      );
    } finally {
      setStockBusyId(null);
    }
  };

  const openStockEditor = (stockItem: ShopStockItem) => {
    setStockEditor(stockItem);
    setStockEditPrice(
      typeof stockItem.card.priceUsd === "number"
        ? String(stockItem.card.priceUsd)
        : "",
    );
    setStockEditImageUrl(stockItem.card.imageUrl ?? "");
    setStockEditError("");
  };

  const saveStockDetails = async () => {
    if (!session || !isSellerRole(session.role) || !stockEditor) {
      return;
    }

    const priceUsd = Number(stockEditPrice.replace(",", "."));

    if (!Number.isFinite(priceUsd) || priceUsd < 0) {
      setStockEditError("Ingresa un precio valido.");
      return;
    }

    setStockEditSaving(true);
    setStockEditError("");

    try {
      const response = await apiFetch(
        `/api/admin/stock/${encodeURIComponent(stockEditor.id)}`,
        {
          method: "PUT",
          headers: {
            ...authHeader(session),
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            card: {
              ...stockEditor.card,
              imageUrl: stockEditImageUrl.trim() || undefined,
              priceUsd,
            },
          }),
        },
      );
      const payload = (await response.json()) as ShopStockResponse;

      if (
        !response.ok ||
        payload.error ||
        !payload.stock ||
        Array.isArray(payload.stock)
      ) {
        throw new Error(payload.error ?? "No se pudo editar el producto.");
      }

      const updatedStock = payload.stock as ShopStockItem;
      setShopStock((current) =>
        current.map((item) =>
          item.id === updatedStock.id ? updatedStock : item,
        ),
      );
      setDraftItems((current) =>
        current.map((item) =>
          item.card.id === updatedStock.card.id &&
          item.card.game === updatedStock.card.game &&
          itemTypeOf(item.card) === itemTypeOf(updatedStock.card)
            ? { ...item, card: updatedStock.card }
            : item,
        ),
      );
      setStockEditor(null);
      setStockMessage(`${updatedStock.card.name} actualizado.`);
    } catch (error) {
      setStockEditError(
        error instanceof Error
          ? error.message
          : "No se pudo editar el producto.",
      );
    } finally {
      setStockEditSaving(false);
    }
  };

  const resetDraftPack = () => {
    setEditingPackId(null);
    setDraftName("Caja personalizada");
    setDraftSeries("Mi serie local");
    setDraftGame("mixed");
    setDraftPrice(20);
    setDraftItems([]);
    setAdminMessage("");
  };

  const startEditingPack = (pack: BoosterPack) => {
    setEditingPackId(pack.id);
    setDraftName(pack.name);
    setDraftSeries(pack.series);
    setDraftGame(pack.game);
    setDraftPrice(pack.price);
    setDraftItems(pack.items);
    setAdminMessage("");
  };

  const saveDraftPack = async () => {
    if (!draftItems.length || !draftName.trim()) {
      return;
    }

    if (!session || !isSellerRole(session.role)) {
      setAdminMessage("Inicia sesion como administrador para guardar cajas.");
      return;
    }

    const normalized = normalizeItems(draftItems, draftPrice);
    const pack: BoosterPack = {
      id: editingPackId ?? crypto.randomUUID(),
      name: draftName.trim(),
      series: draftSeries.trim() || "Serie local",
      game: draftGame,
      price: Math.max(0, Number(draftPrice.toFixed(2))),
      accent: gameAccents[draftGame],
      createdBy: "admin",
      shopId: session.id,
      shopSlug: "pullario",
      shopName: "Pullario",
      items: normalized,
    };

    setAdminSaving(true);
    setAdminMessage("");
    let nextApiStatus: ApiStatus = "offline";

    try {
      const response = await apiFetch("/api/packs", {
        method: "POST",
        headers: {
          ...authHeader(session),
          "Content-Type": "application/json",
        },
        body: JSON.stringify(pack),
      });
      const payload = (await response.json()) as SavePackResponse;
      nextApiStatus = response.status >= 500 ? "offline" : "online";

      if (!response.ok || payload.error || !payload.pack) {
        throw new Error(payload.error ?? "No se pudo guardar la caja.");
      }

      setSavedPacks((current) => [
        payload.pack as BoosterPack,
        ...current.filter((savedPack) => savedPack.id !== payload.pack?.id),
      ]);
      setSelectedPackId(payload.pack.id);
      setEditingPackId(null);
      setDraftItems([]);
      setApiStatus("online");
      setAdminMessage(
        editingPackId ? "Caja actualizada." : "Caja guardada.",
      );
    } catch (error) {
      setApiStatus(nextApiStatus);
      setAdminMessage(
        error instanceof Error
          ? error.message
          : "No se pudo guardar la caja.",
      );
    } finally {
      setAdminSaving(false);
    }
  };

  const deleteSavedPack = async (packId: string) => {
    if (!session || !isSellerRole(session.role)) {
      setAdminMessage("Inicia sesion como administrador para borrar cajas.");
      return;
    }

    setAdminSaving(true);
    setAdminMessage("");
    let nextApiStatus: ApiStatus = "offline";

    try {
      const response = await apiFetch(`/api/packs/${encodeURIComponent(packId)}`, {
        method: "DELETE",
        headers: {
          ...authHeader(session),
        },
      });
      const payload = (await response.json()) as { error?: string };
      nextApiStatus = response.status >= 500 ? "offline" : "online";

      if (!response.ok || payload.error) {
        throw new Error(payload.error ?? "No se pudo borrar la caja.");
      }

      setSavedPacks((current) => current.filter((pack) => pack.id !== packId));
      if (selectedPackId === packId) {
        setSelectedPackId(demoPacks[0].id);
      }
      setApiStatus("online");
      setAdminMessage("Caja borrada.");
    } catch (error) {
      setApiStatus(nextApiStatus);
      setAdminMessage(
        error instanceof Error ? error.message : "No se pudo borrar la caja.",
      );
    } finally {
      setAdminSaving(false);
    }
  };

  // Only runs from openPack (a click handler), so the impure calls below
  // never run during render.
  const spinWithWinner = (winner: PackItem, onDone?: () => void) => {
    spinTimers.current.forEach((timer) => window.clearTimeout(timer));
    spinTimers.current = [];
    if (rouletteTickFrameRef.current !== null) {
      window.cancelAnimationFrame(rouletteTickFrameRef.current);
      rouletteTickFrameRef.current = null;
    }
    setCelebratingRunId(null);

    const targetIndex = 32;
    // eslint-disable-next-line react-hooks/purity
    const runId = Date.now();
    const targetOffset = targetIndex * ROULETTE_STRIDE;
    const strip = Array.from({ length: 42 }, (_, index) => ({
      ...weightedPick(selectedPack.items),
      spinKey: `${runId}-${index}-${crypto.randomUUID()}`,
    }));
    const showcaseHitCandidates = selectedPack.items.filter(
      (item) =>
        item.slotId !== winner.slotId &&
        normalizedProbability(item, selectedPack) < HIT_PROBABILITY_THRESHOLD,
    );
    const showcaseHit = showcaseHitCandidates.length
      ? showcaseHitCandidates[
          // eslint-disable-next-line react-hooks/purity
          Math.floor(Math.random() * showcaseHitCandidates.length)
        ]
      : undefined;

    if (showcaseHit) {
      const showcaseOffsets = [-4, -3, -2, 2, 3, 4];
      const showcaseOffset =
        // eslint-disable-next-line react-hooks/purity
        showcaseOffsets[Math.floor(Math.random() * showcaseOffsets.length)];
      const showcaseIndex = targetIndex + showcaseOffset;
      strip[showcaseIndex] = {
        ...showcaseHit,
        spinKey: `${runId}-showcase-hit-${crypto.randomUUID()}`,
      };
    }

    strip[targetIndex] = {
      ...winner,
      spinKey: `${runId}-winner-${crypto.randomUUID()}`,
    };

    setRoulette({
      packId: selectedPack.id,
      items: strip,
      targetIndex,
      offset: 0,
      phase: "spinning",
      runId,
      result: undefined,
    });

    const spinTimer = window.setTimeout(() => {
      setRoulette((current) =>
        current.runId === runId
          ? {
              ...current,
              offset: targetOffset,
            }
          : current,
      );
      startRouletteTickTracking(runId, targetIndex);
    }, 40);

    const resultTimer = window.setTimeout(() => {
      if (rouletteTickFrameRef.current !== null) {
        window.cancelAnimationFrame(rouletteTickFrameRef.current);
        rouletteTickFrameRef.current = null;
      }
      setRoulette((current) =>
        current.runId === runId
          ? {
              ...current,
              packId: selectedPack.id,
              phase: "done",
              result: winner,
            }
          : current,
      );
      if (normalizedProbability(winner, selectedPack) < HIT_PROBABILITY_THRESHOLD) {
        setCelebratingRunId(runId);
        playHitFanfare();
        const celebrationTimer = window.setTimeout(() => {
          setCelebratingRunId((current) => (current === runId ? null : current));
        }, 3200);
        spinTimers.current.push(celebrationTimer);
      }
      onDone?.();
    }, 3800);

    spinTimers.current = [spinTimer, resultTimer];
  };

  const startRouletteTickTracking = (runId: number, targetIndex: number) => {
    let lastBoundary = 0;

    const readTranslateX = (element: HTMLElement) => {
      const transform = window.getComputedStyle(element).transform;
      if (!transform || transform === "none") return 0;

      const match = transform.match(/^matrix(3d)?\((.+)\)$/);
      if (!match) return 0;

      const values = match[2].split(",").map(Number);
      return match[1] ? values[12] ?? 0 : values[4] ?? 0;
    };

    const sampleTrack = () => {
      const track = rouletteTrackRef.current;
      if (!track || track.dataset.rouletteRun !== String(runId)) {
        rouletteTickFrameRef.current = window.requestAnimationFrame(sampleTrack);
        return;
      }

      const distance = Math.abs(readTranslateX(track));
      const crossedBoundary = Math.min(
        targetIndex,
        Math.floor((distance + 0.5) / ROULETTE_STRIDE),
      );

      if (crossedBoundary > lastBoundary) {
        const crossedThisFrame = crossedBoundary - lastBoundary;
        const progress = Math.min(1, distance / (targetIndex * ROULETTE_STRIDE));
        for (let index = 0; index < crossedThisFrame; index += 1) {
          playRouletteTick(progress, index * 0.005);
        }
        lastBoundary = crossedBoundary;
      }

      if (lastBoundary < targetIndex) {
        rouletteTickFrameRef.current = window.requestAnimationFrame(sampleTrack);
      } else {
        rouletteTickFrameRef.current = null;
      }
    };

    rouletteTickFrameRef.current = window.requestAnimationFrame(sampleTrack);
  };

  const openPack = async () => {
    if (!session) {
      setAuthMessage("Registrate o inicia sesion para abrir cajas.");
      return;
    }

    const currentPackIsSpinning =
      roulette.phase === "spinning" && roulette.packId === selectedPack.id;

    if (
      (view === "pack" && !selectedPackExists) ||
      !selectedPack.items.length ||
      currentPackIsSpinning ||
      openingPack
    ) {
      return;
    }

    setOpeningPack(true);
    setAuthMessage("");
    await prepareRouletteAudio();

    try {
      if (selectedPack.createdBy === "demo") {
        spinWithWinner(weightedPick(selectedPack.items));
        return;
      }

      const response = await apiFetch(
        `/api/packs/${encodeURIComponent(selectedPack.id)}/open`,
        {
          method: "POST",
          headers: {
            ...authHeader(session),
          },
        },
      );
      const payload = (await response.json()) as OpenPackResponse;

      if (!response.ok || payload.error || !payload.item) {
        throw new Error(payload.error ?? "No se pudo abrir la caja.");
      }

      spinWithWinner(payload.item, () => {
        updateSessionUser(payload.user);
        setAuthMessage("");
        void loadWonCards();
        void loadRecentDrops(selectedPack.id);
        void loadDbPacks();
        if (isSellerRole(session.role)) {
          void loadShopStock();
          void loadShopOrders();
        }
      });
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "No se pudo abrir la caja.";

      if (message.toLowerCase().includes("saldo insuficiente")) {
        setWonCardsMessageTone("warning");
        setWonCardsMessage(message);
      } else {
        setAuthMessage(message);
      }
    } finally {
      setOpeningPack(false);
    }
  };

  return {
    initialPackId,
    view,
    selectedPackId,
    setSelectedPackId,
    savedPacks,
    setSavedPacks,
    apiStatus,
    setApiStatus,
    session,
    setSession,
    authMode,
    setAuthMode,
    loginUsername,
    setLoginUsername,
    loginPassword,
    setLoginPassword,
    loginEmail,
    setLoginEmail,
    authMessage,
    setAuthMessage,
    homeAuthOpen,
    setHomeAuthOpen,
    adminMessage,
    setAdminMessage,
    adminSaving,
    setAdminSaving,
    profileDisplayName,
    setProfileDisplayName,
    profileEmail,
    setProfileEmail,
    profileFullName,
    setProfileFullName,
    profilePhone,
    setProfilePhone,
    profileStreet,
    setProfileStreet,
    profileStreetNumber,
    setProfileStreetNumber,
    profileFloor,
    setProfileFloor,
    profileApartment,
    setProfileApartment,
    profileAddressReference,
    setProfileAddressReference,
    profileCity,
    setProfileCity,
    profileProvince,
    setProfileProvince,
    profilePostalCode,
    setProfilePostalCode,
    profileCountry,
    setProfileCountry,
    profilePassword,
    setProfilePassword,
    profileMessage,
    setProfileMessage,
    profileSaving,
    setProfileSaving,
    profileSectionView,
    setProfileSectionView,
    publicSearch,
    setPublicSearch,
    adminSearch,
    setAdminSearch,
    selectedCard,
    setSelectedCard,
    walletOpen,
    setWalletOpen,
    walletAmount,
    setWalletAmount,
    walletMessage,
    setWalletMessage,
    walletSaving,
    setWalletSaving,
    wonCardsOpen,
    setWonCardsOpen,
    wonCards,
    setWonCards,
    wonCardsMessage,
    setWonCardsMessage,
    wonCardsMessageTone,
    setWonCardsMessageTone,
    wonCardBusyId,
    setWonCardBusyId,
    upgraderTargets,
    setUpgraderTargets,
    upgraderStakeIds,
    setUpgraderStakeIds,
    upgraderTargetId,
    setUpgraderTargetId,
    upgraderTargetQuantity,
    setUpgraderTargetQuantity,
    upgraderQuery,
    setUpgraderQuery,
    upgraderGame,
    setUpgraderGame,
    upgraderPreset,
    setUpgraderPreset,
    upgraderMinPrice,
    setUpgraderMinPrice,
    upgraderMaxPrice,
    setUpgraderMaxPrice,
    upgraderLoading,
    setUpgraderLoading,
    upgraderPlaying,
    setUpgraderPlaying,
    upgraderRotation,
    setUpgraderRotation,
    upgraderOutcome,
    setUpgraderOutcome,
    upgraderTimerRef,
    changerTargets,
    setChangerTargets,
    changerStakeIds,
    setChangerStakeIds,
    changerTargetQuantities,
    setChangerTargetQuantities,
    changerQuery,
    setChangerQuery,
    changerGame,
    setChangerGame,
    changerLoading,
    setChangerLoading,
    changerSaving,
    setChangerSaving,
    changerOutcome,
    setChangerOutcome,
    inventoryActiveOnly,
    setInventoryActiveOnly,
    inventoryPriceSort,
    setInventoryPriceSort,
    profilePrizeView,
    setProfilePrizeView,
    shopStock,
    setShopStock,
    stockMessage,
    setStockMessage,
    stockBusyId,
    setStockBusyId,
    stockEditor,
    setStockEditor,
    stockEditPrice,
    setStockEditPrice,
    stockEditImageUrl,
    setStockEditImageUrl,
    stockEditError,
    setStockEditError,
    stockEditSaving,
    setStockEditSaving,
    stockQuantityDrafts,
    setStockQuantityDrafts,
    stockGameFilter,
    setStockGameFilter,
    stockPrizeFilter,
    setStockPrizeFilter,
    packStockGameFilter,
    setPackStockGameFilter,
    packPrizeFilter,
    setPackPrizeFilter,
    sealedType,
    setSealedType,
    sealedGame,
    setSealedGame,
    sealedName,
    setSealedName,
    sealedSetName,
    setSealedSetName,
    sealedPrice,
    setSealedPrice,
    sealedImageUrl,
    setSealedImageUrl,
    sealedQuantity,
    setSealedQuantity,
    sealedQuery,
    setSealedQuery,
    sealedResults,
    setSealedResults,
    sealedSearchLoading,
    setSealedSearchLoading,
    sealedSearchError,
    setSealedSearchError,
    manualSealedOpen,
    setManualSealedOpen,
    shopOrders,
    setShopOrders,
    ordersMessage,
    setOrdersMessage,
    selectedShipmentIds,
    setSelectedShipmentIds,
    shippingModalOpen,
    setShippingModalOpen,
    shipmentTrackingNumber,
    setShipmentTrackingNumber,
    shippingOrders,
    setShippingOrders,
    activeShipments,
    setActiveShipments,
    shipmentHistory,
    setShipmentHistory,
    shipmentView,
    setShipmentView,
    shipmentsMessage,
    setShipmentsMessage,
    shipmentBusyKey,
    setShipmentBusyKey,
    adminUsers,
    setAdminUsers,
    adminUserQuery,
    setAdminUserQuery,
    selectedAdminUser,
    setSelectedAdminUser,
    adminUserCards,
    setAdminUserCards,
    adminUsersMessage,
    setAdminUsersMessage,
    adminUsersLoading,
    setAdminUsersLoading,
    adminInventoryActiveOnly,
    setAdminInventoryActiveOnly,
    adminInventoryMinPrice,
    setAdminInventoryMinPrice,
    adminInventoryMaxPrice,
    setAdminInventoryMaxPrice,
    adminInventorySort,
    setAdminInventorySort,
    adminUserView,
    setAdminUserView,
    editingPackId,
    setEditingPackId,
    draftName,
    setDraftName,
    draftSeries,
    setDraftSeries,
    draftGame,
    setDraftGame,
    draftPrice,
    setDraftPrice,
    draftItems,
    setDraftItems,
    draftPriceSort,
    setDraftPriceSort,
    recentDrops,
    setRecentDrops,
    recentDropsLoading,
    setRecentDropsLoading,
    openingPack,
    setOpeningPack,
    roulette,
    setRoulette,
    celebratingRunId,
    setCelebratingRunId,
    spinTimers,
    audioContextRef,
    rouletteTrackRef,
    rouletteTickFrameRef,
    upgraderNeedleRef,
    upgraderTickFrameRef,
    loadDbPacks,
    loadWonCards,
    loadUpgraderOptions,
    loadChangerOptions,
    loadShopStock,
    loadShopOrders,
    toggleShipmentSelection,
    markSelectedOrdersShipped,
    loadShopShipments,
    markShipmentReceived,
    loadAdminUsers,
    loadAdminUserCards,
    loadRecentDrops,
    packs,
    sellerPacks,
    activePackId,
    selectedPackExists,
    selectedPack,
    selectedTopItem,
    heroShowcaseItems,
    rouletteBelongsToSelectedPack,
    visibleRouletteItems,
    visibleRouletteOffset,
    visibleRoulettePhase,
    visibleRouletteResult,
    visibleRouletteRunId,
    idleRouletteItems,
    draftProbabilityTotal,
    draftExpectedValue,
    draftMargin,
    ownedWonCards,
    ownedWonCardsValue,
    upgraderStakeCards,
    upgraderStakeValue,
    upgraderTarget,
    upgraderTargetMaxQuantity,
    upgraderTargetValue,
    upgraderChance,
    upgraderMultiplier,
    parsedUpgraderMinPrice,
    parsedUpgraderMaxPrice,
    effectiveUpgraderMinPrice,
    effectiveUpgraderMaxPrice,
    filteredUpgraderTargets,
    changerStakeCards,
    changerStakeValue,
    changerSelectedTargets,
    changerTargetUnits,
    changerTargetValue,
    changerRefund,
    filteredChangerTargets,
    visibleInventoryCards,
    userWithdrawalGroups,
    sortedDraftItems,
    withdrawnOrderCount,
    filteredShopStock,
    packBuilderStock,
    groupedShopOrders,
    selectedShipmentsReady,
    selectedShipmentUserId,
    groupShipmentItems,
    activeShipmentGroups,
    shipmentHistoryGroups,
    minAdminPrice,
    maxAdminPrice,
    visibleAdminUserCards,
    adminUserWithdrawalGroups,
    stockCountsByGame,
    stockCountsByType,
    stockQuantityForCard,
    showCardDetails,
    runSearch,
    storeSession,
    updateSessionUser,
    submitAuth,
    logout,
    addCardToDraft,
    updateDraftProbability,
    removeDraftItem,
    addCardToStock,
    addSealedProductToStock,
    searchSealedProducts,
    selectSealedSearchResult,
    updateStockQuantity,
    openStockEditor,
    saveStockDetails,
    resetDraftPack,
    startEditingPack,
    topUpWallet,
    toggleUpgraderStake,
    chooseUpgraderPreset,
    playUpgrader,
    toggleChangerStake,
    addChangerTarget,
    removeChangerTarget,
    playChanger,
    sellWonCard,
    withdrawWonCard,
    saveDraftPack,
    deleteSavedPack,
    updateProfile,
    spinWithWinner,
    prepareRouletteAudio,
    playRouletteTick,
    startRouletteTickTracking,
    startUpgraderTickTracking,
    playUpgraderResultSound,
    playHitFanfare,
    openPack,
  };
}

export type MarketState = ReturnType<typeof useMarketState>;
