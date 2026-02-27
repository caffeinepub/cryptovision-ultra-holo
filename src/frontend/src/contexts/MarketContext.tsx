import type React from "react";
import { createContext, useCallback, useContext, useState } from "react";
import { MarketMode } from "../backend.d";

interface MarketContextType {
  marketMode: MarketMode;
  setMarketMode: (mode: MarketMode) => void;
}

const MarketContext = createContext<MarketContextType | null>(null);

export function MarketProvider({ children }: { children: React.ReactNode }) {
  const [marketMode, setMarketModeState] = useState<MarketMode>(
    MarketMode.normal,
  );

  const setMarketMode = useCallback((mode: MarketMode) => {
    setMarketModeState(mode);
  }, []);

  return (
    <MarketContext.Provider value={{ marketMode, setMarketMode }}>
      {children}
    </MarketContext.Provider>
  );
}

export function useMarketContext() {
  const ctx = useContext(MarketContext);
  if (!ctx)
    throw new Error("useMarketContext must be used within MarketProvider");
  return ctx;
}
