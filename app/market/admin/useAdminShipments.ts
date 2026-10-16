import { useCallback, useEffect, useState } from "react";
import { apiFetch, authHeader } from "../api";
import type { AuthState } from "../auth/useAuth";
import { isSellerRole } from "../catalog";
import type {
  DeliverShipmentResponse,
  MarketProps,
  ShopOrderItem,
  ShopShipmentsResponse,
} from "../types";

type AdminShipmentsDeps =
  Pick<AuthState, "session"> &
  Pick<MarketProps, "view">;

export function useAdminShipments(deps: AdminShipmentsDeps) {
  const { session, view } = deps;

  const [activeShipments, setActiveShipments] = useState<ShopOrderItem[]>([]);
  const [shipmentHistory, setShipmentHistory] = useState<ShopOrderItem[]>([]);
  const [shipmentView, setShipmentView] = useState<"active" | "history">(
    "active",
  );
  const [shipmentsMessage, setShipmentsMessage] = useState("");
  const [shipmentBusyKey, setShipmentBusyKey] = useState<string | null>(null);

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
  const visibleShipmentGroups =
    shipmentView === "active" ? activeShipmentGroups : shipmentHistoryGroups;

  return {
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
    loadShopShipments,
    markShipmentReceived,
    groupShipmentItems,
    activeShipmentGroups,
    shipmentHistoryGroups,
    visibleShipmentGroups,
  };
}

export type AdminShipmentsState = ReturnType<typeof useAdminShipments>;
