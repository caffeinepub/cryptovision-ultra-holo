import { useCallback, useEffect, useRef, useState } from "react";
import { MarketMode } from "../backend.d";

export interface CoinPrice {
  symbol: string;
  name: string;
  price: number;
  change24h: number;
  changePercent24h: number;
  volume24h: number;
  marketCap: number;
  history: number[];
  emoji: string;
  color: string;
}

const INITIAL_PRICES: Record<
  string,
  {
    price: number;
    name: string;
    volume24h: number;
    marketCap: number;
    emoji: string;
    color: string;
  }
> = {
  BTC: {
    price: 67423.5,
    name: "Bitcoin",
    volume24h: 28_400_000_000,
    marketCap: 1_326_000_000_000,
    emoji: "₿",
    color: "#F7931A",
  },
  ETH: {
    price: 3241.8,
    name: "Ethereum",
    volume24h: 15_200_000_000,
    marketCap: 389_000_000_000,
    emoji: "Ξ",
    color: "#627EEA",
  },
  SOL: {
    price: 182.45,
    name: "Solana",
    volume24h: 3_800_000_000,
    marketCap: 82_000_000_000,
    emoji: "◎",
    color: "#9945FF",
  },
  BNB: {
    price: 415.2,
    name: "BNB",
    volume24h: 1_900_000_000,
    marketCap: 60_000_000_000,
    emoji: "⬡",
    color: "#F3BA2F",
  },
  ADA: {
    price: 0.4523,
    name: "Cardano",
    volume24h: 420_000_000,
    marketCap: 16_000_000_000,
    emoji: "₳",
    color: "#0033AD",
  },
  DOGE: {
    price: 0.1821,
    name: "Dogecoin",
    volume24h: 1_100_000_000,
    marketCap: 26_000_000_000,
    emoji: "Ð",
    color: "#C2A633",
  },
  XRP: {
    price: 0.5912,
    name: "XRP",
    volume24h: 1_450_000_000,
    marketCap: 34_000_000_000,
    emoji: "✕",
    color: "#346AA9",
  },
  MATIC: {
    price: 0.8734,
    name: "Polygon",
    volume24h: 380_000_000,
    marketCap: 8_600_000_000,
    emoji: "⬟",
    color: "#8247E5",
  },
};

function generateHistory(startPrice: number, points = 50): number[] {
  const history: number[] = [startPrice];
  for (let i = 1; i < points; i++) {
    const prev = history[i - 1];
    const change = prev * (Math.random() * 0.04 - 0.02);
    history.push(Math.max(prev + change, 0.0001));
  }
  return history;
}

function getMarketDrift(mode: MarketMode): number {
  switch (mode) {
    case MarketMode.bull:
      return 0.008;
    case MarketMode.bear:
      return -0.008;
    default:
      return 0;
  }
}

export function usePrices(marketMode: MarketMode = MarketMode.normal) {
  const [prices, setPrices] = useState<Record<string, CoinPrice>>(() => {
    const initial: Record<string, CoinPrice> = {};
    for (const [symbol, data] of Object.entries(INITIAL_PRICES)) {
      const history = generateHistory(data.price);
      initial[symbol] = {
        symbol,
        name: data.name,
        price: data.price,
        change24h: (Math.random() - 0.5) * data.price * 0.1,
        changePercent24h: (Math.random() - 0.5) * 10,
        volume24h: data.volume24h,
        marketCap: data.marketCap,
        history,
        emoji: data.emoji,
        color: data.color,
      };
    }
    return initial;
  });

  const prevPricesRef = useRef<Record<string, number>>({});

  const updatePrices = useCallback(() => {
    const drift = getMarketDrift(marketMode);
    setPrices((prev) => {
      const updated = { ...prev };
      for (const symbol of Object.keys(updated)) {
        const coin = updated[symbol];
        const fluctuation = Math.random() * 0.04 - 0.02 + drift;
        const newPrice = Math.max(coin.price * (1 + fluctuation), 0.0001);
        const oldPrice = prevPricesRef.current[symbol] ?? coin.price;
        const change24h =
          newPrice - (INITIAL_PRICES[symbol]?.price ?? newPrice);
        const changePercent24h =
          (change24h / (INITIAL_PRICES[symbol]?.price ?? newPrice)) * 100;

        prevPricesRef.current[symbol] = oldPrice;
        const newHistory = [...coin.history.slice(1), newPrice];

        updated[symbol] = {
          ...coin,
          price: newPrice,
          change24h,
          changePercent24h,
          history: newHistory,
        };
      }
      return updated;
    });
  }, [marketMode]);

  useEffect(() => {
    const interval = setInterval(updatePrices, 3000);
    return () => clearInterval(interval);
  }, [updatePrices]);

  const priceList = Object.values(prices);

  return { prices, priceList };
}

export type { MarketMode };
