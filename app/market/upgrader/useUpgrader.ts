import { useCallback, useEffect, useRef, useState } from "react";
import { apiFetch, authHeader } from "../api";
import type { RouletteAudioState } from "../audio/useRouletteAudio";
import type { AuthState } from "../auth/useAuth";
import { itemTypeOf } from "../catalog";
import { safeUpgraderLandingPercent } from "../constants";
import type { NoticeState } from "../layout/useNotice";
import type { InventoryState } from "../profile/useInventory";
import type {
  MarketProps,
  PackGame,
  ShopStockItem,
  UpgraderOptionsResponse,
  UpgraderPlayResponse,
} from "../types";

type UpgraderDeps =
  Pick<AuthState, "session" | "setHomeAuthOpen"> &
  Pick<InventoryState, "loadWonCards" | "ownedWonCards" | "setWonCards"> &
  Pick<MarketProps, "view"> &
  Pick<NoticeState, "setWonCardsMessage" | "setWonCardsMessageTone"> &
  Pick<
    RouletteAudioState,
    | "playRouletteTick"
    | "playUpgraderResultSound"
    | "prepareRouletteAudio"
  >;

export function useUpgrader(deps: UpgraderDeps) {
  const {
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
  } = deps;

  const [upgraderTargets, setUpgraderTargets] = useState<ShopStockItem[]>([]);
  const [upgraderStakeIds, setUpgraderStakeIds] = useState<number[]>([]);
  const [upgraderTargetId, setUpgraderTargetId] = useState<number | null>(null);
  const [upgraderTargetQuantity, setUpgraderTargetQuantity] = useState(1);
  const [upgraderQuery, setUpgraderQuery] = useState("");
  const [upgraderGame, setUpgraderGame] = useState<PackGame>("mixed");
  const [upgraderPreset, setUpgraderPreset] = useState<number | null>(null);
  const [upgraderMinPrice, setUpgraderMinPrice] = useState("");
  const [upgraderMaxPrice, setUpgraderMaxPrice] = useState("");
  const [upgraderLoading, setUpgraderLoading] = useState(false);
  const [upgraderPlaying, setUpgraderPlaying] = useState(false);
  const [upgraderRotation, setUpgraderRotation] = useState(0);
  const [upgraderOutcome, setUpgraderOutcome] =
    useState<UpgraderPlayResponse | null>(null);
  const upgraderTimerRef = useRef<number | null>(null);
  const upgraderNeedleRef = useRef<HTMLDivElement | null>(null);
  const upgraderTickFrameRef = useRef<number | null>(null);

  const loadUpgraderOptions = useCallback(async () => {
    setUpgraderLoading(true);
    try {
      const response = await apiFetch("/api/upgrader", {
        headers: session
          ? { ...authHeader(session) }
          : undefined,
      });
      const payload = (await response.json()) as UpgraderOptionsResponse;

      if (!response.ok || payload.error) {
        throw new Error(payload.error ?? "No se pudo cargar el Upgrader.");
      }

      if (session) {
        setWonCards((current) => {
          const history = current.filter(
            (item) => item.status !== "owned" && item.status !== "waiting_stock",
          );
          return [...(payload.inventory ?? []), ...history];
        });
      }
      setUpgraderTargets(payload.targets ?? []);
    } catch (error) {
      setWonCardsMessageTone("error");
      setWonCardsMessage(
        error instanceof Error ? error.message : "No se pudo cargar el Upgrader.",
      );
    } finally {
      setUpgraderLoading(false);
    }
  }, [session, setWonCardsMessage, setWonCardsMessageTone, setWonCards]);

  useEffect(() => {
    if (view !== "upgrader") {
      return;
    }

    const timer = window.setTimeout(() => {
      void loadUpgraderOptions();
    }, 0);

    return () => window.clearTimeout(timer);
  }, [loadUpgraderOptions, session, view]);

  useEffect(
    () => () => {
      if (upgraderTimerRef.current !== null) {
        window.clearTimeout(upgraderTimerRef.current);
      }
    },
    [],
  );

  useEffect(() => {
    return () => {
      if (upgraderTickFrameRef.current !== null) {
        window.cancelAnimationFrame(upgraderTickFrameRef.current);
      }
    };
  }, []);
  const upgraderStakeCards = ownedWonCards.filter((item) =>
    upgraderStakeIds.includes(item.id),
  );
  const upgraderStakeValue = Number(
    upgraderStakeCards
      .reduce((total, item) => total + Math.max(0, item.valueUsd), 0)
      .toFixed(2),
  );
  const upgraderTarget =
    upgraderTargets.find((item) => item.id === upgraderTargetId) ?? null;
  const upgraderTargetMaxQuantity = Math.min(
    20,
    Math.max(1, upgraderTarget?.quantity ?? 1),
  );
  const upgraderTargetValue = Number(
    (
      Number(upgraderTarget?.card.priceUsd ?? 0) * upgraderTargetQuantity
    ).toFixed(2),
  );
  const upgraderChance =
    upgraderStakeValue > 0 && upgraderTargetValue > upgraderStakeValue
      ? Math.min(
          80,
          (upgraderStakeValue / upgraderTargetValue) * 100 * 0.9,
        )
      : 0;
  const upgraderMultiplier =
    upgraderStakeValue > 0 && upgraderTargetValue > 0
      ? upgraderTargetValue / upgraderStakeValue
      : 0;
  const parsedUpgraderMinPrice = Number(upgraderMinPrice);
  const parsedUpgraderMaxPrice = Number(upgraderMaxPrice);
  const effectiveUpgraderMinPrice =
    upgraderMinPrice.trim() && Number.isFinite(parsedUpgraderMinPrice)
      ? Math.max(0, parsedUpgraderMinPrice)
      : 0;
  const effectiveUpgraderMaxPrice =
    upgraderMaxPrice.trim() && Number.isFinite(parsedUpgraderMaxPrice)
      ? Math.max(0, parsedUpgraderMaxPrice)
      : Number.POSITIVE_INFINITY;

  useEffect(() => {
    // Pre-existing reset-on-change effect, kept as is by the refactor.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setUpgraderTargetQuantity(1);
  }, [upgraderTargetId]);

  useEffect(() => {
    if (upgraderPreset === null) {
      return;
    }

    // Pre-existing reset-on-change effect, kept as is by the refactor.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setUpgraderMinPrice(
      upgraderStakeValue > 0
        ? String(Number((upgraderStakeValue * upgraderPreset).toFixed(2)))
        : "",
    );
    setUpgraderMaxPrice("");
    setUpgraderTargetId(null);
  }, [upgraderPreset, upgraderStakeValue]);

  const filteredUpgraderTargets = upgraderTargets.filter((item) => {
    const price = Number(item.card.priceUsd ?? 0);
    const maximumTargetValue = price * Math.min(20, Math.max(1, item.quantity));
    const repeatsStake = upgraderStakeCards.some(
      (stake) =>
        stake.card.id === item.card.id &&
        stake.card.game === item.card.game &&
        itemTypeOf(stake.card) === itemTypeOf(item.card),
    );
    const gameMatches =
      upgraderGame === "mixed" || item.card.game === upgraderGame;
    const query = upgraderQuery.trim().toLocaleLowerCase("es");
    const queryMatches =
      !query ||
      item.card.name.toLocaleLowerCase("es").includes(query) ||
      item.card.setName.toLocaleLowerCase("es").includes(query);

    return (
      !repeatsStake &&
      maximumTargetValue > upgraderStakeValue &&
      price >= effectiveUpgraderMinPrice &&
      price <= effectiveUpgraderMaxPrice &&
      gameMatches &&
      queryMatches
    );
  });

  const toggleUpgraderStake = (cardId: number) => {
    if (upgraderPlaying) {
      return;
    }

    setUpgraderOutcome(null);
    setUpgraderStakeIds((current) => {
      if (current.includes(cardId)) {
        return current.filter((id) => id !== cardId);
      }

      if (current.length >= 20) {
        setWonCardsMessageTone("warning");
        setWonCardsMessage("Podés apostar hasta 20 premios juntos.");
        return current;
      }

      return [...current, cardId];
    });
  };

  const chooseUpgraderPreset = (multiplier: number) => {
    if (!upgraderStakeValue) {
      setWonCardsMessageTone("warning");
      setWonCardsMessage("Primero elegí uno o más premios para apostar.");
      return;
    }

    setUpgraderPreset(multiplier);
    setUpgraderMinPrice(
      String(Number((upgraderStakeValue * multiplier).toFixed(2))),
    );
    setUpgraderMaxPrice("");
    setUpgraderTargetId(null);
    setUpgraderOutcome(null);
  };

  const playUpgrader = async () => {
    if (!session) {
      setHomeAuthOpen(true);
      return;
    }

    if (!upgraderStakeIds.length || !upgraderTarget) {
      setWonCardsMessageTone("warning");
      setWonCardsMessage("Elegí tus premios y un objetivo antes de jugar.");
      return;
    }

    await prepareRouletteAudio();
    setUpgraderPlaying(true);
    setUpgraderOutcome(null);
    setWonCardsMessage("");

    try {
      const response = await apiFetch("/api/upgrader/play", {
        method: "POST",
        headers: {
          ...authHeader(session),
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          stakeCardIds: upgraderStakeIds,
          targetStockId: upgraderTarget.id,
          targetQuantity: upgraderTargetQuantity,
        }),
      });
      const payload = (await response.json()) as UpgraderPlayResponse;

      if (
        !response.ok ||
        payload.error ||
        typeof payload.won !== "boolean" ||
        typeof payload.roll !== "number"
      ) {
        throw new Error(payload.error ?? "No se pudo completar el Upgrader.");
      }

      const landingPercent = safeUpgraderLandingPercent(
        payload.roll,
        payload.chance ?? upgraderChance,
        payload.won,
      );
      const targetAngle = landingPercent * 3.6;
      setUpgraderRotation((current) => {
        const currentAngle = ((current % 360) + 360) % 360;
        const finalTurn = (targetAngle - currentAngle + 360) % 360;
        return current + 1440 + finalTurn;
      });
      window.setTimeout(() => startUpgraderTickTracking(), 30);

      upgraderTimerRef.current = window.setTimeout(() => {
        if (upgraderTickFrameRef.current !== null) {
          window.cancelAnimationFrame(upgraderTickFrameRef.current);
          upgraderTickFrameRef.current = null;
        }
        setUpgraderOutcome(payload);
        setUpgraderPlaying(false);
        setUpgraderStakeIds([]);
        setUpgraderTargetId(null);
        setUpgraderPreset(null);
        setUpgraderMinPrice("");
        setUpgraderMaxPrice("");
        setWonCardsMessageTone(payload.won ? "success" : "warning");
        setWonCardsMessage(
          payload.won
            ? "¡Upgrade conseguido! El premio ya está en tu inventario."
            : "El upgrade no salió esta vez.",
        );
        playUpgraderResultSound(payload.won);
        void loadWonCards();
        void loadUpgraderOptions();
        upgraderTimerRef.current = null;
      }, 4200);
    } catch (error) {
      if (upgraderTickFrameRef.current !== null) {
        window.cancelAnimationFrame(upgraderTickFrameRef.current);
        upgraderTickFrameRef.current = null;
      }
      setUpgraderPlaying(false);
      setWonCardsMessageTone("error");
      setWonCardsMessage(
        error instanceof Error
          ? error.message
          : "No se pudo completar el Upgrader.",
      );
      void loadWonCards();
      void loadUpgraderOptions();
    }
  };

  const startUpgraderTickTracking = () => {
    if (upgraderTickFrameRef.current !== null) {
      window.cancelAnimationFrame(upgraderTickFrameRef.current);
    }

    let lastAngle: number | null = null;
    let travelledAngle = 0;
    let lastBoundary = 0;
    const startedAt = performance.now();

    const sampleNeedle = () => {
      const needle = upgraderNeedleRef.current;
      if (!needle) {
        upgraderTickFrameRef.current = null;
        return;
      }

      const transform = window.getComputedStyle(needle).transform;
      const match = transform.match(/^matrix\((.+)\)$/);
      if (match) {
        const values = match[1].split(",").map(Number);
        const angle = (Math.atan2(values[1] ?? 0, values[0] ?? 1) * 180) / Math.PI;
        const normalizedAngle = (angle + 360) % 360;

        if (lastAngle !== null) {
          travelledAngle += (normalizedAngle - lastAngle + 360) % 360;
          const crossedBoundary = Math.floor(travelledAngle / 12);
          if (crossedBoundary > lastBoundary) {
            const progress = Math.min(1, (performance.now() - startedAt) / 4000);
            const crossedThisFrame = Math.min(3, crossedBoundary - lastBoundary);
            for (let index = 0; index < crossedThisFrame; index += 1) {
              playRouletteTick(progress, index * 0.005);
            }
            lastBoundary = crossedBoundary;
          }
        }
        lastAngle = normalizedAngle;
      }

      if (performance.now() - startedAt < 4100) {
        upgraderTickFrameRef.current = window.requestAnimationFrame(sampleNeedle);
      } else {
        upgraderTickFrameRef.current = null;
      }
    };

    upgraderTickFrameRef.current = window.requestAnimationFrame(sampleNeedle);
  };

  return {
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
    upgraderNeedleRef,
    upgraderTickFrameRef,
    loadUpgraderOptions,
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
    toggleUpgraderStake,
    chooseUpgraderPreset,
    playUpgrader,
    startUpgraderTickTracking,
  };
}

export type UpgraderState = ReturnType<typeof useUpgrader>;
