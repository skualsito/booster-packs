import { createContext, useContext } from "react";
import type { MarketState } from "./useMarketState";

export const MarketContext = createContext<MarketState | null>(null);

export function useMarket() {
  const market = useContext(MarketContext);

  if (!market) {
    throw new Error("useMarket must be used inside MarketContext.Provider.");
  }

  return market;
}
