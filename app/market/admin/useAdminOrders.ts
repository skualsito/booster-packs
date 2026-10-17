import { useCallback, useEffect, useState } from "react";
import { apiFetch } from "../api";
import type { AuthState } from "../auth/useAuth";
import { isSellerRole } from "../catalog";
import type {
  ShipOrdersResponse,
  ShopOrderItem,
  ShopOrdersResponse,
} from "../types";

type AdminOrdersDeps = Pick<AuthState, "session">;

export function useAdminOrders(deps: AdminOrdersDeps) {
  const { session } = deps;

  const [shopOrders, setShopOrders] = useState<ShopOrderItem[]>([]);
  const [ordersMessage, setOrdersMessage] = useState("");
  const [selectedShipmentIds, setSelectedShipmentIds] = useState<number[]>([]);
  const [shippingModalOpen, setShippingModalOpen] = useState(false);
  const [shipmentTrackingNumber, setShipmentTrackingNumber] = useState("");
  const [shippingOrders, setShippingOrders] = useState(false);

  const loadShopOrders = useCallback(async () => {
    if (!session || !isSellerRole(session.role)) {
      return [];
    }

    try {
      const response = await apiFetch("/api/admin/orders");
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

  useEffect(() => {
    if (!isSellerRole(session?.role)) {
      return;
    }

    const timer = window.setTimeout(() => {
      void loadShopOrders();
    }, 0);

    return () => window.clearTimeout(timer);
  }, [loadShopOrders, session?.role]);
  const withdrawnOrderCount = shopOrders.filter(
    (item) => item.status === "withdrawn",
  ).length;
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

  return {
    setShopOrders,
    ordersMessage,
    selectedShipmentIds,
    setSelectedShipmentIds,
    shippingModalOpen,
    setShippingModalOpen,
    shipmentTrackingNumber,
    setShipmentTrackingNumber,
    shippingOrders,
    loadShopOrders,
    toggleShipmentSelection,
    markSelectedOrdersShipped,
    withdrawnOrderCount,
    groupedShopOrders,
    selectedShipmentsReady,
    selectedShipmentUserId,
  };
}

export type AdminOrdersState = ReturnType<typeof useAdminOrders>;
