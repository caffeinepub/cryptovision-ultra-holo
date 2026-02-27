export type Page =
  | "dashboard"
  | "trade"
  | "portfolio"
  | "charts"
  | "alerts"
  | "gamification"
  | "academy"
  | "settings";

export interface PageProps {
  prices: Record<string, import("../hooks/usePrices").CoinPrice>;
  priceList: import("../hooks/usePrices").CoinPrice[];
  userData?: import("../backend.d").UserDataView;
  onNavigate: (page: Page) => void;
}
