import { useCallback, useEffect, useState } from "react";
import { apiFetch, authHeader } from "../api";
import type { AuthState } from "../auth/useAuth";
import { isSellerRole } from "../catalog";
import type {
  AdminUserCardsResponse,
  AdminUsersResponse,
  AdminUserSummary,
  MarketProps,
  UserCardItem,
} from "../types";

type AdminUsersPanelDeps =
  Pick<AuthState, "session"> &
  Pick<MarketProps, "view">;

export function useAdminUsersPanel(deps: AdminUsersPanelDeps) {
  const { session, view } = deps;

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

  return {
    adminUsers,
    adminUserQuery,
    setAdminUserQuery,
    selectedAdminUser,
    adminUsersMessage,
    adminUsersLoading,
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
    loadAdminUsers,
    loadAdminUserCards,
    visibleAdminUserCards,
    adminUserWithdrawalGroups,
  };
}

export type AdminUsersPanelState = ReturnType<typeof useAdminUsersPanel>;
