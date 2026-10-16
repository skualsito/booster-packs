import { useState } from "react";
import type { ExternalCard } from "../../lib/card-search";
import { newSearchState } from "../catalog";
import type {
  SearchResponse,
  SearchState,
  SelectedCardDetails,
} from "../types";

export function useCardSearch() {
  const [publicSearch, setPublicSearch] = useState<SearchState>(
    newSearchState("one-piece", ""),
  );
  const [adminSearch, setAdminSearch] = useState<SearchState>(
    newSearchState("pokemon", ""),
  );
  const [selectedCard, setSelectedCard] = useState<SelectedCardDetails | null>(
    null,
  );

  const showCardDetails = (card: ExternalCard) => {
    setSelectedCard({ card });
  };

  const runSearch = async (
    context: "public" | "admin",
    override?: Partial<SearchState>,
    append = false,
  ) => {
    const current = context === "public" ? publicSearch : adminSearch;

    if (append && (current.loading || current.loadingMore || !current.hasMore)) {
      return;
    }

    const next = { ...current, ...override };
    const setter = context === "public" ? setPublicSearch : setAdminSearch;
    const query = next.query.trim();
    const setName = next.setName.trim();
    const number = next.number.trim();

    if (query.length < 2 && setName.length < 2) {
      setter({
        ...next,
        error: "Escribi una carta o un set para buscar.",
        results: [],
        hasMore: false,
        loadingMore: false,
        page: 0,
      });
      return;
    }

    const requestedPage = append ? current.page + 1 : 1;
    setter({
      ...next,
      loading: !append,
      loadingMore: append,
      error: "",
      results: append ? current.results : [],
      hasMore: append ? current.hasMore : false,
      page: append ? current.page : 0,
    });

    try {
      const params = new URLSearchParams({ game: next.game });

      if (query) {
        params.set("q", query);
      }

      if (setName) {
        params.set("set", setName);
      }

      if (number) {
        params.set("number", number);
      }

      if (next.rarity.trim()) {
        params.set("rarity", next.rarity.trim());
      }

      params.set("page", String(requestedPage));
      params.set("sort", next.sort);

      const response = await fetch(`/api/cards/search?${params.toString()}`);
      const payload = (await response.json()) as SearchResponse;

      if (!response.ok || payload.error) {
        throw new Error(payload.error ?? "No se pudo buscar.");
      }

      setter((currentState) => {
        if (
          currentState.game !== next.game ||
          currentState.query !== next.query ||
          currentState.setName !== next.setName ||
          currentState.number !== next.number ||
          currentState.rarity !== next.rarity ||
          currentState.sort !== next.sort
        ) {
          return currentState;
        }

        const incomingCards = payload.cards ?? [];
        const results = append
          ? Array.from(
              new Map(
                [...currentState.results, ...incomingCards].map((card) => [
                  `${card.game}:${card.id}`,
                  card,
                ]),
              ).values(),
            )
          : incomingCards;

        return {
          ...currentState,
          results,
          loading: false,
          loadingMore: false,
          hasMore: payload.meta?.hasMore ?? false,
          page: payload.meta?.page ?? requestedPage,
          error: "",
        };
      });
    } catch (error) {
      setter((currentState) => {
        if (
          currentState.game !== next.game ||
          currentState.query !== next.query ||
          currentState.setName !== next.setName ||
          currentState.number !== next.number ||
          currentState.rarity !== next.rarity ||
          currentState.sort !== next.sort
        ) {
          return currentState;
        }

        return {
          ...currentState,
          results: append ? currentState.results : [],
          loading: false,
          loadingMore: false,
          hasMore: false,
          error: error instanceof Error ? error.message : "No se pudo buscar.",
        };
      });
    }
  };

  return {
    publicSearch,
    setPublicSearch,
    adminSearch,
    setAdminSearch,
    selectedCard,
    setSelectedCard,
    showCardDetails,
    runSearch,
  };
}

export type CardSearchState = ReturnType<typeof useCardSearch>;
