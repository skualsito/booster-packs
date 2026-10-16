import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useAdminOrders } from "./admin/useAdminOrders";
import { useAdminPacks } from "./admin/useAdminPacks";
import { useAdminShipments } from "./admin/useAdminShipments";
import { useAdminStock } from "./admin/useAdminStock";
import { useAdminUsersPanel } from "./admin/useAdminUsersPanel";
import { apiFetch, authHeader, clearStoredSession } from "./api";
import { useRouletteAudio } from "./audio/useRouletteAudio";
import { useAuth } from "./auth/useAuth";
import { useCardSearch } from "./cards/useCardSearch";
import { isSellerRole } from "./catalog";
import { useChanger } from "./changer/useChanger";
import { HIT_PROBABILITY_THRESHOLD, ROULETTE_STRIDE } from "./constants";
import { useCatalog } from "./home/useCatalog";
import { useNotice } from "./layout/useNotice";
import { normalizedProbability, weightedPick } from "./pack-math";
import { useInventory } from "./profile/useInventory";
import { useProfileForm } from "./profile/useProfileForm";
import { useWallet } from "./profile/useWallet";
import type {
  MarketProps,
  OpenPackResponse,
  PackItem,
  RecentDrop,
  RecentDropsResponse,
  RouletteState,
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
  const adminPacks = useAdminPacks({
    savedPacks,
    selectedPackId,
    session,
    setApiStatus,
    setSavedPacks,
    setSelectedPackId,
  });
  const {
    addCardToDraft,
    adminMessage,
    adminSaving,
    deleteSavedPack,
    draftExpectedValue,
    draftGame,
    draftItems,
    draftMargin,
    draftName,
    draftPrice,
    draftPriceSort,
    draftProbabilityTotal,
    draftSeries,
    editingPackId,
    packPrizeFilter,
    packStockGameFilter,
    removeDraftItem,
    resetDraftPack,
    saveDraftPack,
    sellerPacks,
    setAdminMessage,
    setAdminSaving,
    setDraftGame,
    setDraftItems,
    setDraftName,
    setDraftPrice,
    setDraftPriceSort,
    setDraftSeries,
    setEditingPackId,
    setPackPrizeFilter,
    setPackStockGameFilter,
    sortedDraftItems,
    startEditingPack,
    updateDraftProbability,
  } = adminPacks;
  const adminStock = useAdminStock({
    draftGame,
    packPrizeFilter,
    packStockGameFilter,
    session,
    setDraftItems,
  });
  const {
    addCardToStock,
    addSealedProductToStock,
    filteredShopStock,
    loadShopStock,
    manualSealedOpen,
    openStockEditor,
    packBuilderStock,
    saveStockDetails,
    sealedGame,
    sealedImageUrl,
    sealedName,
    sealedPrice,
    sealedQuantity,
    sealedQuery,
    sealedResults,
    sealedSearchError,
    sealedSearchLoading,
    sealedSetName,
    sealedType,
    searchSealedProducts,
    selectSealedSearchResult,
    setManualSealedOpen,
    setSealedGame,
    setSealedImageUrl,
    setSealedName,
    setSealedPrice,
    setSealedQuantity,
    setSealedQuery,
    setSealedResults,
    setSealedSearchError,
    setSealedSearchLoading,
    setSealedSetName,
    setSealedType,
    setShopStock,
    setStockBusyId,
    setStockEditError,
    setStockEditImageUrl,
    setStockEditor,
    setStockEditPrice,
    setStockEditSaving,
    setStockGameFilter,
    setStockMessage,
    setStockPrizeFilter,
    setStockQuantityDrafts,
    shopStock,
    stockBusyId,
    stockCountsByGame,
    stockCountsByType,
    stockEditError,
    stockEditImageUrl,
    stockEditor,
    stockEditPrice,
    stockEditSaving,
    stockGameFilter,
    stockMessage,
    stockPrizeFilter,
    stockQuantityDrafts,
    stockQuantityForCard,
    updateStockQuantity,
  } = adminStock;
  const adminOrders = useAdminOrders({ session });
  const {
    groupedShopOrders,
    loadShopOrders,
    markSelectedOrdersShipped,
    ordersMessage,
    selectedShipmentIds,
    selectedShipmentsReady,
    selectedShipmentUserId,
    setOrdersMessage,
    setSelectedShipmentIds,
    setShipmentTrackingNumber,
    setShippingModalOpen,
    setShippingOrders,
    setShopOrders,
    shipmentTrackingNumber,
    shippingModalOpen,
    shippingOrders,
    shopOrders,
    toggleShipmentSelection,
    withdrawnOrderCount,
  } = adminOrders;
  const adminShipments = useAdminShipments({ session, view });
  const {
    activeShipmentGroups,
    activeShipments,
    groupShipmentItems,
    loadShopShipments,
    markShipmentReceived,
    setActiveShipments,
    setShipmentBusyKey,
    setShipmentHistory,
    setShipmentsMessage,
    setShipmentView,
    shipmentBusyKey,
    shipmentHistory,
    shipmentHistoryGroups,
    visibleShipmentGroups,
    shipmentsMessage,
    shipmentView,
  } = adminShipments;
  const adminUsersPanel = useAdminUsersPanel({ session, view });
  const {
    adminInventoryActiveOnly,
    adminInventoryMaxPrice,
    adminInventoryMinPrice,
    adminInventorySort,
    adminUserCards,
    adminUserQuery,
    adminUsers,
    adminUsersLoading,
    adminUsersMessage,
    adminUserView,
    adminUserWithdrawalGroups,
    loadAdminUserCards,
    loadAdminUsers,
    maxAdminPrice,
    minAdminPrice,
    selectedAdminUser,
    setAdminInventoryActiveOnly,
    setAdminInventoryMaxPrice,
    setAdminInventoryMinPrice,
    setAdminInventorySort,
    setAdminUserCards,
    setAdminUserQuery,
    setAdminUsers,
    setAdminUsersLoading,
    setAdminUsersMessage,
    setAdminUserView,
    setSelectedAdminUser,
    visibleAdminUserCards,
  } = adminUsersPanel;
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
    return () => {
      spinTimers.current.forEach((timer) => window.clearTimeout(timer));
      if (rouletteTickFrameRef.current !== null) {
        window.cancelAnimationFrame(rouletteTickFrameRef.current);
      }
    };
  }, []);
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
    visibleShipmentGroups,
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
