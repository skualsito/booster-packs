import { useCallback, useEffect, useMemo, useState } from "react";
import { apiFetch } from "../api";
import { demoPacks } from "../demo-packs";
import { topItem } from "../pack-math";
import type {
  ApiStatus,
  BoosterPack,
  MarketProps,
  PacksResponse,
} from "../types";

type CatalogDeps = Pick<MarketProps, "initialPackId" | "view">;

export function useCatalog(deps: CatalogDeps) {
  const { initialPackId, view } = deps;

  const [selectedPackId, setSelectedPackId] = useState(
    initialPackId ?? demoPacks[0].id,
  );
  const [savedPacks, setSavedPacks] = useState<BoosterPack[]>([]);
  const [apiStatus, setApiStatus] = useState<ApiStatus>("checking");

  const loadDbPacks = useCallback(async () => {
    setApiStatus("checking");

    try {
      const response = await apiFetch("/api/packs");
      const payload = (await response.json()) as PacksResponse;

      if (!response.ok || payload.error) {
        throw new Error(payload.error ?? "No se pudieron cargar las cajas.");
      }

      setSavedPacks(payload.packs ?? []);
      setApiStatus("online");
      return payload.packs ?? [];
    } catch {
      setApiStatus("offline");
      return [];
    }
  }, []);

  useEffect(() => {
    const timer = window.setTimeout(() => {
      void loadDbPacks();
    }, 0);

    return () => window.clearTimeout(timer);
  }, [loadDbPacks]);

  const packs = useMemo(
    () => (savedPacks.length ? savedPacks : demoPacks),
    [savedPacks],
  );
  const activePackId = view === "pack" && initialPackId ? initialPackId : selectedPackId;
  const selectedPackExists = packs.some((pack) => pack.id === activePackId);
  const selectedPack = packs.find((pack) => pack.id === activePackId) ?? packs[0];
  const selectedTopItem = topItem(selectedPack);
  const heroShowcaseItems = [...selectedPack.items]
    .sort((a, b) => (b.card.priceUsd ?? 0) - (a.card.priceUsd ?? 0))
    .slice(0, 4);

  return {
    selectedPackId,
    setSelectedPackId,
    savedPacks,
    setSavedPacks,
    apiStatus,
    setApiStatus,
    loadDbPacks,
    packs,
    selectedPackExists,
    selectedPack,
    selectedTopItem,
    heroShowcaseItems,
  };
}

export type CatalogState = ReturnType<typeof useCatalog>;
