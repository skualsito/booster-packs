import { useState } from "react";
import type { ExternalCard, PrizeItemType } from "../../lib/card-search";
import { apiFetch } from "../api";
import type { AuthState } from "../auth/useAuth";
import { gameAccents, isSellerRole, itemTypeOf } from "../catalog";
import { demoPacks } from "../demo-packs";
import type { CatalogState } from "../home/useCatalog";
import { normalizeItems, packExpectedValue } from "../pack-math";
import type {
  ApiStatus,
  BoosterPack,
  PackGame,
  PackItem,
  SavePackResponse,
} from "../types";

type AdminPacksDeps =
  Pick<AuthState, "session"> &
  Pick<
    CatalogState,
    | "savedPacks"
    | "selectedPackId"
    | "setApiStatus"
    | "setSavedPacks"
    | "setSelectedPackId"
  >;

export function useAdminPacks(deps: AdminPacksDeps) {
  const {
    savedPacks,
    selectedPackId,
    session,
    setApiStatus,
    setSavedPacks,
    setSelectedPackId,
  } = deps;

  const [adminMessage, setAdminMessage] = useState("");
  const [adminSaving, setAdminSaving] = useState(false);
  const [packStockGameFilter, setPackStockGameFilter] =
    useState<PackGame>("mixed");
  const [packPrizeFilter, setPackPrizeFilter] = useState<PrizeItemType | "all">(
    "all",
  );
  const [editingPackId, setEditingPackId] = useState<string | null>(null);
  const [draftName, setDraftName] = useState("Caja personalizada");
  const [draftSeries, setDraftSeries] = useState("Mi serie local");
  const [draftGame, setDraftGame] = useState<PackGame>("mixed");
  const [draftPrice, setDraftPrice] = useState(20);
  const [draftItems, setDraftItems] = useState<PackItem[]>([]);
  const [draftPriceSort, setDraftPriceSort] = useState<
    "price-desc" | "price-asc"
  >("price-desc");
  const sellerPacks = isSellerRole(session?.role) ? savedPacks : [];
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

  return {
    adminMessage,
    adminSaving,
    packStockGameFilter,
    setPackStockGameFilter,
    packPrizeFilter,
    setPackPrizeFilter,
    editingPackId,
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
    sellerPacks,
    draftProbabilityTotal,
    draftExpectedValue,
    draftMargin,
    sortedDraftItems,
    addCardToDraft,
    updateDraftProbability,
    removeDraftItem,
    resetDraftPack,
    startEditingPack,
    saveDraftPack,
    deleteSavedPack,
  };
}

export type AdminPacksState = ReturnType<typeof useAdminPacks>;
