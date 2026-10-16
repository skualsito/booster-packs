import { useCallback, useEffect, useState } from "react";
import type {
  CardGame,
  ExternalCard,
  PrizeItemType,
} from "../../lib/card-search";
import { apiFetch, authHeader } from "../api";
import type { AuthState } from "../auth/useAuth";
import {
  cardGames,
  isSellerRole,
  itemTypeOf,
  prizeItemTypes,
  prizeTypeLabels,
} from "../catalog";
import type { PackGame, ShopStockItem, ShopStockResponse } from "../types";
import type { AdminPacksState } from "./useAdminPacks";

type AdminStockDeps =
  Pick<
    AdminPacksState,
    | "draftGame"
    | "packPrizeFilter"
    | "packStockGameFilter"
    | "setDraftItems"
  > &
  Pick<AuthState, "session">;

export function useAdminStock(deps: AdminStockDeps) {
  const {
    draftGame,
    packPrizeFilter,
    packStockGameFilter,
    session,
    setDraftItems,
  } = deps;

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

  useEffect(() => {
    if (!isSellerRole(session?.role)) {
      return;
    }

    const timer = window.setTimeout(() => {
      void loadShopStock();
    }, 0);

    return () => window.clearTimeout(timer);
  }, [loadShopStock, session?.role]);
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

  return {
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
    loadShopStock,
    filteredShopStock,
    packBuilderStock,
    stockCountsByGame,
    stockCountsByType,
    stockQuantityForCard,
    addCardToStock,
    addSealedProductToStock,
    searchSealedProducts,
    selectSealedSearchResult,
    updateStockQuantity,
    openStockEditor,
    saveStockDetails,
  };
}

export type AdminStockState = ReturnType<typeof useAdminStock>;
