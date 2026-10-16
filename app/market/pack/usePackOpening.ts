import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import type { AdminOrdersState } from "../admin/useAdminOrders";
import type { AdminStockState } from "../admin/useAdminStock";
import { apiFetch, authHeader } from "../api";
import type { RouletteAudioState } from "../audio/useRouletteAudio";
import type { AuthState } from "../auth/useAuth";
import { isSellerRole } from "../catalog";
import { HIT_PROBABILITY_THRESHOLD, ROULETTE_STRIDE } from "../constants";
import type { CatalogState } from "../home/useCatalog";
import type { NoticeState } from "../layout/useNotice";
import { normalizedProbability, weightedPick } from "../pack-math";
import type { InventoryState } from "../profile/useInventory";
import type {
  MarketProps,
  OpenPackResponse,
  PackItem,
  RecentDrop,
  RecentDropsResponse,
  RouletteState,
} from "../types";

type PackOpeningDeps =
  Pick<AdminOrdersState, "loadShopOrders"> &
  Pick<AdminStockState, "loadShopStock"> &
  Pick<AuthState, "session" | "setAuthMessage" | "updateSessionUser"> &
  Pick<CatalogState, "loadDbPacks" | "selectedPack" | "selectedPackExists"> &
  Pick<InventoryState, "loadWonCards"> &
  Pick<MarketProps, "view"> &
  Pick<NoticeState, "setWonCardsMessage" | "setWonCardsMessageTone"> &
  Pick<
    RouletteAudioState,
    | "playHitFanfare"
    | "playRouletteTick"
    | "prepareRouletteAudio"
  >;

export function usePackOpening(deps: PackOpeningDeps) {
  const {
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
  } = deps;

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
    rouletteTrackRef,
    rouletteTickFrameRef,
    loadRecentDrops,
    rouletteBelongsToSelectedPack,
    visibleRouletteItems,
    visibleRouletteOffset,
    visibleRoulettePhase,
    visibleRouletteResult,
    visibleRouletteRunId,
    idleRouletteItems,
    spinWithWinner,
    startRouletteTickTracking,
    openPack,
  };
}

export type PackOpeningState = ReturnType<typeof usePackOpening>;
