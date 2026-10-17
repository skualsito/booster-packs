import { useCallback, useEffect, useState } from "react";
import { apiFetch } from "../api";
import type { AuthState } from "../auth/useAuth";
import { formatUsd } from "../format";
import type { NoticeState } from "../layout/useNotice";
import type { InventoryState } from "../profile/useInventory";
import type {
  ChangerPlayResponse,
  MarketProps,
  PackGame,
  ShopStockItem,
  UpgraderOptionsResponse,
} from "../types";

type ChangerDeps =
  Pick<
    AuthState,
    | "session"
    | "setAuthMode"
    | "setHomeAuthOpen"
    | "updateSessionUser"
  > &
  Pick<InventoryState, "loadWonCards" | "ownedWonCards" | "setWonCards"> &
  Pick<MarketProps, "view"> &
  Pick<NoticeState, "setWonCardsMessage" | "setWonCardsMessageTone">;

export function useChanger(deps: ChangerDeps) {
  const {
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
  } = deps;

  const [changerTargets, setChangerTargets] = useState<ShopStockItem[]>([]);
  const [changerStakeIds, setChangerStakeIds] = useState<number[]>([]);
  const [changerTargetQuantities, setChangerTargetQuantities] = useState<Record<number, number>>({});
  const [changerQuery, setChangerQuery] = useState("");
  const [changerGame, setChangerGame] = useState<PackGame>("mixed");
  const [changerLoading, setChangerLoading] = useState(false);
  const [changerSaving, setChangerSaving] = useState(false);
  const [changerOutcome, setChangerOutcome] = useState<ChangerPlayResponse | null>(null);

  const loadChangerOptions = useCallback(async () => {
    setChangerLoading(true);
    try {
      const response = await apiFetch("/api/changer");
      const payload = (await response.json()) as UpgraderOptionsResponse;

      if (!response.ok || payload.error) {
        throw new Error(payload.error ?? "No se pudo cargar el Changer.");
      }

      if (session) {
        setWonCards((current) => {
          const history = current.filter(
            (item) => item.status !== "owned" && item.status !== "waiting_stock",
          );
          return [...(payload.inventory ?? []), ...history];
        });
      }
      setChangerTargets(payload.targets ?? []);
    } catch (error) {
      setWonCardsMessageTone("error");
      setWonCardsMessage(
        error instanceof Error ? error.message : "No se pudo cargar el Changer.",
      );
    } finally {
      setChangerLoading(false);
    }
  }, [session, setWonCardsMessage, setWonCardsMessageTone, setWonCards]);

  useEffect(() => {
    if (view !== "changer") return;
    const timer = window.setTimeout(() => void loadChangerOptions(), 0);
    return () => window.clearTimeout(timer);
  }, [loadChangerOptions, session, view]);

  // Reset the board when the logged-in user changes (adjusting state during
  // render instead of in an effect).
  const [changerSessionId, setChangerSessionId] = useState(session?.id);
  if (changerSessionId !== session?.id) {
    setChangerSessionId(session?.id);
    setChangerStakeIds([]);
    setChangerTargetQuantities({});
    setChangerOutcome(null);
  }
  const changerStakeCards = ownedWonCards.filter((item) =>
    changerStakeIds.includes(item.id),
  );
  const changerStakeValue = Number(
    changerStakeCards
      .reduce((total, item) => total + Math.max(0, item.valueUsd), 0)
      .toFixed(2),
  );
  const changerSelectedTargets = changerTargets
    .map((item) => ({
      item,
      quantity: changerTargetQuantities[item.id] ?? 0,
    }))
    .filter((selection) => selection.quantity > 0);
  const changerTargetUnits = changerSelectedTargets.reduce(
    (total, selection) => total + selection.quantity,
    0,
  );
  const changerTargetValue = Number(
    changerSelectedTargets
      .reduce(
        (total, selection) =>
          total + Number(selection.item.card.priceUsd ?? 0) * selection.quantity,
        0,
      )
      .toFixed(2),
  );
  const changerRefund = Number(
    Math.max(0, changerStakeValue - changerTargetValue).toFixed(2),
  );
  const filteredChangerTargets = changerTargets.filter((item) => {
    const query = changerQuery.trim().toLocaleLowerCase("es");
    return (
      (changerGame === "mixed" || item.card.game === changerGame) &&
      (!query ||
        item.card.name.toLocaleLowerCase("es").includes(query) ||
        item.card.setName.toLocaleLowerCase("es").includes(query))
    );
  });

  const toggleChangerStake = (cardId: number) => {
    if (changerSaving) return;
    setChangerOutcome(null);
    setChangerStakeIds((current) => {
      if (current.includes(cardId)) {
        return current.filter((id) => id !== cardId);
      }
      return current.length >= 20 ? current : [...current, cardId];
    });
  };

  const addChangerTarget = (item: ShopStockItem) => {
    if (!session || changerSaving || !changerStakeIds.length) return;
    const price = Number(item.card.priceUsd ?? 0);
    const currentQuantity = changerTargetQuantities[item.id] ?? 0;
    if (
      price <= 0 ||
      currentQuantity >= Math.min(20, item.quantity) ||
      changerTargetUnits >= 20 ||
      changerTargetValue + price > changerStakeValue + 0.0001
    ) {
      return;
    }
    setChangerOutcome(null);
    setChangerTargetQuantities((current) => ({
      ...current,
      [item.id]: (current[item.id] ?? 0) + 1,
    }));
  };

  const removeChangerTarget = (stockId: number) => {
    if (changerSaving) return;
    setChangerOutcome(null);
    setChangerTargetQuantities((current) => {
      const quantity = current[stockId] ?? 0;
      if (quantity <= 1) {
        const next = { ...current };
        delete next[stockId];
        return next;
      }
      return { ...current, [stockId]: quantity - 1 };
    });
  };

  const playChanger = async () => {
    if (!session) {
      setAuthMode("login");
      setHomeAuthOpen(true);
      return;
    }
    if (
      !changerStakeIds.length ||
      !changerSelectedTargets.length ||
      changerTargetValue <= 0 ||
      changerTargetValue > changerStakeValue
    ) {
      return;
    }

    setChangerSaving(true);
    setChangerOutcome(null);
    try {
      const response = await apiFetch("/api/changer/play", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          stakeCardIds: changerStakeIds,
          targetItems: changerSelectedTargets.map((selection) => ({
            stockId: selection.item.id,
            quantity: selection.quantity,
          })),
        }),
      });
      const payload = (await response.json()) as ChangerPlayResponse;
      if (!response.ok || payload.error || !payload.runId) {
        throw new Error(payload.error ?? "No se pudo completar el cambio.");
      }

      updateSessionUser(payload.user);
      setChangerOutcome(payload);
      setChangerStakeIds([]);
      setChangerTargetQuantities({});
      setWonCardsMessageTone("success");
      setWonCardsMessage(
        payload.refundUsd
          ? `Cambio completado. Se acreditaron ${formatUsd.format(payload.refundUsd)} en tu cartera.`
          : "Cambio completado.",
      );
      await Promise.all([loadWonCards(), loadChangerOptions()]);
    } catch (error) {
      setWonCardsMessageTone("error");
      setWonCardsMessage(
        error instanceof Error ? error.message : "No se pudo completar el cambio.",
      );
      void loadChangerOptions();
    } finally {
      setChangerSaving(false);
    }
  };

  return {
    changerStakeIds,
    changerTargetQuantities,
    changerQuery,
    setChangerQuery,
    changerGame,
    setChangerGame,
    changerLoading,
    changerSaving,
    changerOutcome,
    changerStakeCards,
    changerStakeValue,
    changerSelectedTargets,
    changerTargetUnits,
    changerTargetValue,
    changerRefund,
    filteredChangerTargets,
    toggleChangerStake,
    addChangerTarget,
    removeChangerTarget,
    playChanger,
  };
}

export type ChangerState = ReturnType<typeof useChanger>;
