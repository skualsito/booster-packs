import { useCallback, useEffect, useState } from "react";
import { apiFetch } from "../api";
import type { AuthState } from "../auth/useAuth";
import { formatUsd } from "../format";
import type { NoticeState } from "../layout/useNotice";
import type { UserCardItem, UserCardsResponse, WalletResponse } from "../types";
import type { ProfileFormState } from "./useProfileForm";

type InventoryDeps =
  Pick<AuthState, "session" | "setAuthMessage" | "updateSessionUser"> &
  Pick<NoticeState, "setWonCardsMessage" | "setWonCardsMessageTone"> &
  Pick<ProfileFormState, "setProfileSectionView">;

export function useInventory(deps: InventoryDeps) {
  const {
    session,
    setAuthMessage,
    setProfileSectionView,
    setWonCardsMessage,
    setWonCardsMessageTone,
    updateSessionUser,
  } = deps;

  const [wonCardsOpen, setWonCardsOpen] = useState(false);
  const [wonCards, setWonCards] = useState<UserCardItem[]>([]);
  const [wonCardBusyId, setWonCardBusyId] = useState<number | null>(null);
  const [inventoryActiveOnly, setInventoryActiveOnly] = useState(false);
  const [inventoryPriceSort, setInventoryPriceSort] = useState<
    "price-desc" | "price-asc"
  >("price-desc");
  const [profilePrizeView, setProfilePrizeView] = useState<
    "inventory" | "shipments"
  >("inventory");

  const loadWonCards = useCallback(async () => {
    if (!session) {
      return [];
    }

    try {
      const response = await apiFetch("/api/me/cards");
      const payload = (await response.json()) as UserCardsResponse;

      if (!response.ok || payload.error) {
        throw new Error(payload.error ?? "No se pudo leer tus cartas.");
      }

      setWonCards(payload.cards ?? []);
      return payload.cards ?? [];
    } catch (error) {
      setWonCardsMessageTone("error");
      setWonCardsMessage(
        error instanceof Error ? error.message : "No se pudo leer tus cartas.",
      );
      return [];
    }
  }, [session, setWonCardsMessage, setWonCardsMessageTone]);

  useEffect(() => {
    if (!session) {
      return;
    }

    const timer = window.setTimeout(() => {
      void loadWonCards();
    }, 0);

    return () => window.clearTimeout(timer);
  }, [loadWonCards, session]);
  const ownedWonCards = session
    ? wonCards.filter(
        (item) => item.status === "owned" || item.status === "waiting_stock",
      )
    : [];
  const ownedWonCardsValue = ownedWonCards.reduce(
    (total, item) => total + Math.max(0, item.valueUsd),
    0,
  );
  const visibleInventoryCards = wonCards
    .filter(
      (item) =>
        item.status !== "withdrawn" &&
        (!inventoryActiveOnly ||
          item.status === "owned" ||
          item.status === "waiting_stock"),
    )
    .sort((left, right) =>
      inventoryPriceSort === "price-desc"
        ? right.valueUsd - left.valueUsd
        : left.valueUsd - right.valueUsd,
    );
  const userWithdrawalGroups = Object.values(
    wonCards
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
        group.shipmentStatus = shipmentStatus;
        group.shippedAt = item.shippedAt ?? group.shippedAt;
        group.deliveredAt = item.deliveredAt ?? group.deliveredAt;
        groups[key] = group;
        return groups;
      }, {}),
  ).sort((left, right) => {
    const leftDate =
      left.deliveredAt ?? left.shippedAt ?? left.items[0]?.acquiredAt ?? "";
    const rightDate =
      right.deliveredAt ?? right.shippedAt ?? right.items[0]?.acquiredAt ?? "";
    return rightDate.localeCompare(leftDate);
  });

  const sellWonCard = async (cardId: number) => {
    if (!session) {
      return;
    }

    setWonCardBusyId(cardId);
    setWonCardsMessage("");

    try {
      const response = await apiFetch(
        `/api/me/cards/${encodeURIComponent(cardId)}/sell`,
        {
          method: "POST",
        },
      );
      const payload = (await response.json()) as WalletResponse;

      if (!response.ok || payload.error || !payload.user) {
        throw new Error(payload.error ?? "No se pudo vender el premio.");
      }

      updateSessionUser(payload.user);
      setAuthMessage("");
      void loadWonCards();
      setWonCardsMessageTone("success");
      setWonCardsMessage(
        `Premio vendido por ${formatUsd.format(payload.valueUsd ?? 0)}.`,
      );
    } catch (error) {
      setWonCardsMessageTone("error");
      setWonCardsMessage(
        error instanceof Error ? error.message : "No se pudo vender el premio.",
      );
    } finally {
      setWonCardBusyId(null);
    }
  };

  const withdrawWonCard = async (cardId: number) => {
    if (!session) {
      return;
    }

    if (!session.hasShippingAddress) {
      const missing = session.shippingAddressMissing ?? [];
      setWonCardsMessageTone("warning");
      setWonCardsMessage(
        missing.length
          ? `Completa estos datos antes de retirar premios: ${missing.join(", ")}.`
          : "Completa tu nombre y domicilio en Datos personales antes de retirar premios.",
      );
      setProfileSectionView("personal");
      return;
    }

    setWonCardBusyId(cardId);
    setWonCardsMessage("");

    try {
      const response = await apiFetch(
        `/api/me/cards/${encodeURIComponent(cardId)}/withdraw`,
        {
          method: "POST",
        },
      );
      const payload = (await response.json()) as {
        error?: string;
        waitingForStock?: boolean;
      };

      if (!response.ok || payload.error) {
        throw new Error(payload.error ?? "No se pudo retirar el premio.");
      }

      void loadWonCards();
      if (payload.waitingForStock) {
        setWonCardsMessageTone("warning");
        setWonCardsMessage(
          "No hay stock disponible en este momento. Tu retiro queda pendiente y te notificaremos cuando vuelva a haber stock.",
        );
      } else {
        setWonCardsMessageTone("success");
        setWonCardsMessage(
          "Retiro confirmado. Pronto te enviaremos por mail el numero de seguimiento del envio.",
        );
      }
    } catch (error) {
      setWonCardsMessageTone("error");
      setWonCardsMessage(
        error instanceof Error ? error.message : "No se pudo retirar el premio.",
      );
    } finally {
      setWonCardBusyId(null);
    }
  };

  return {
    wonCardsOpen,
    setWonCardsOpen,
    setWonCards,
    wonCardBusyId,
    inventoryActiveOnly,
    setInventoryActiveOnly,
    inventoryPriceSort,
    setInventoryPriceSort,
    profilePrizeView,
    setProfilePrizeView,
    loadWonCards,
    ownedWonCards,
    ownedWonCardsValue,
    visibleInventoryCards,
    userWithdrawalGroups,
    sellWonCard,
    withdrawWonCard,
  };
}

export type InventoryState = ReturnType<typeof useInventory>;
