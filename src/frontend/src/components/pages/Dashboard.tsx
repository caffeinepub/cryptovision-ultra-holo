import { cn } from "@/lib/utils";
import {
  Activity,
  ArrowRight,
  TrendingDown,
  TrendingUp,
  Wallet,
  Zap,
} from "lucide-react";
import { type Variants, motion } from "motion/react";
import type { UserDataView } from "../../backend.d";
import { useMarketContext } from "../../contexts/MarketContext";
import type { CoinPrice } from "../../hooks/usePrices";
import type { Page } from "../../types/navigation";
import CoinIcon from "../CoinIcon";

interface DashboardProps {
  prices: Record<string, CoinPrice>;
  priceList: CoinPrice[];
  userData?: UserDataView;
  onNavigate: (page: Page) => void;
}

const container: Variants = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { staggerChildren: 0.08 } },
};

const item: Variants = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0, transition: { duration: 0.4, ease: "easeOut" } },
};

function formatUSD(n: number) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 2,
  }).format(n);
}

function formatCompact(n: number) {
  if (n >= 1e12) return `$${(n / 1e12).toFixed(2)}T`;
  if (n >= 1e9) return `$${(n / 1e9).toFixed(2)}B`;
  if (n >= 1e6) return `$${(n / 1e6).toFixed(2)}M`;
  return `$${n.toFixed(2)}`;
}

function SparkLine({ data, up }: { data: number[]; up: boolean }) {
  const min = Math.min(...data);
  const max = Math.max(...data);
  const range = max - min || 1;
  const points = data
    .map(
      (v, i) =>
        `${(i / (data.length - 1)) * 100},${100 - ((v - min) / range) * 100}`,
    )
    .join(" ");

  return (
    <svg
      viewBox="0 0 100 100"
      className="w-20 h-10"
      preserveAspectRatio="none"
      aria-hidden="true"
    >
      <polyline
        points={points}
        fill="none"
        stroke={up ? "oklch(0.82 0.2 150)" : "oklch(0.72 0.22 330)"}
        strokeWidth="3"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function CoinRow({ coin }: { coin: CoinPrice }) {
  const up = coin.changePercent24h >= 0;
  return (
    <motion.div
      variants={item}
      className="flex items-center gap-3 p-3 rounded-lg hover:bg-muted/30 transition-all cursor-default group"
    >
      <div
        className="coin-3d w-10 h-10 flex items-center justify-center glass-card rounded-full overflow-hidden"
        style={{ boxShadow: `0 0 10px ${coin.color}40` }}
      >
        <CoinIcon symbol={coin.symbol} size={32} />
      </div>
      <div className="flex-1 min-w-0">
        <div className="font-mono font-bold text-sm text-foreground">
          {coin.symbol}
        </div>
        <div className="text-xs text-muted-foreground truncate">
          {coin.name}
        </div>
      </div>
      <div className="hidden sm:block">
        <SparkLine data={coin.history} up={up} />
      </div>
      <div className="text-right">
        <div className="font-mono font-bold text-sm">
          {coin.price >= 1
            ? formatUSD(coin.price)
            : `$${coin.price.toFixed(4)}`}
        </div>
        <div
          className={cn("text-xs font-mono", up ? "price-up" : "price-down")}
        >
          {up ? "+" : ""}
          {coin.changePercent24h.toFixed(2)}%
        </div>
      </div>
    </motion.div>
  );
}

export default function Dashboard({
  prices,
  priceList,
  userData,
  onNavigate,
}: DashboardProps) {
  const { marketMode } = useMarketContext();

  const portfolioValue = userData
    ? userData.balance +
      (Array.isArray(userData.portfolio)
        ? userData.portfolio.reduce(
            (sum: number, h: { coin: string; quantity: number }) => {
              const price = prices[h.coin]?.price ?? 0;
              return sum + h.quantity * price;
            },
            0,
          )
        : 0)
    : 10000;

  const topMovers = [...priceList]
    .sort((a, b) => Math.abs(b.changePercent24h) - Math.abs(a.changePercent24h))
    .slice(0, 3);

  const trending = [...priceList]
    .sort((a, b) => b.volume24h - a.volume24h)
    .slice(0, 4);

  const totalMarketCap = priceList.reduce((s, c) => s + c.marketCap, 0);

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      {/* Page Header */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
      >
        <h1 className="font-display text-2xl lg:text-3xl font-bold gradient-text-holo">
          Mission Control
        </h1>
        <p className="text-muted-foreground text-sm mt-1">
          Real-time holographic market overview
        </p>
      </motion.div>

      {/* Stats Row */}
      <motion.div
        variants={container}
        initial="hidden"
        animate="show"
        className="grid grid-cols-2 lg:grid-cols-4 gap-4"
      >
        {/* Portfolio Value */}
        <motion.div variants={item} className="col-span-2 lg:col-span-1">
          <div className="glass-card neon-border-cyan p-4 h-full scanline relative overflow-hidden">
            <div className="flex items-start justify-between mb-3">
              <div className="text-xs text-muted-foreground uppercase tracking-wider">
                Portfolio Value
              </div>
              <Wallet className="w-4 h-4 text-primary opacity-70" />
            </div>
            <div className="font-display font-bold text-2xl neon-cyan">
              {formatUSD(portfolioValue)}
            </div>
            <div className="text-xs text-muted-foreground mt-1">
              Cash: {formatUSD(userData?.balance ?? 10000)}
            </div>
          </div>
        </motion.div>

        {/* Market Cap */}
        <motion.div variants={item}>
          <div className="glass-card-purple p-4 h-full">
            <div className="flex items-start justify-between mb-3">
              <div className="text-xs text-muted-foreground uppercase tracking-wider">
                Total Mkt Cap
              </div>
              <Activity className="w-4 h-4 text-secondary opacity-70" />
            </div>
            <div className="font-display font-bold text-xl neon-purple">
              {formatCompact(totalMarketCap)}
            </div>
            <div className="text-xs text-muted-foreground mt-1">
              8 tracked coins
            </div>
          </div>
        </motion.div>

        {/* BTC Price */}
        <motion.div variants={item}>
          <div className="glass-card-green p-4 h-full">
            <div className="flex items-start justify-between mb-3">
              <div className="text-xs text-muted-foreground uppercase tracking-wider">
                Bitcoin
              </div>
              <span className="text-sm font-bold" style={{ color: "#F7931A" }}>
                ₿
              </span>
            </div>
            <div className="font-display font-bold text-xl neon-green">
              {formatUSD(prices.BTC?.price ?? 0)}
            </div>
            <div
              className={cn(
                "text-xs font-mono mt-1",
                (prices.BTC?.changePercent24h ?? 0) >= 0
                  ? "price-up"
                  : "price-down",
              )}
            >
              {(prices.BTC?.changePercent24h ?? 0) >= 0 ? "+" : ""}
              {(prices.BTC?.changePercent24h ?? 0).toFixed(2)}%
            </div>
          </div>
        </motion.div>

        {/* Market Mode */}
        <motion.div variants={item}>
          <div className="glass-card p-4 h-full">
            <div className="flex items-start justify-between mb-3">
              <div className="text-xs text-muted-foreground uppercase tracking-wider">
                Market Mode
              </div>
              <Zap className="w-4 h-4 text-accent opacity-70" />
            </div>
            <div
              className={cn(
                "font-display font-bold text-xl uppercase tracking-wide",
                marketMode === "bull" && "neon-green",
                marketMode === "bear" && "neon-pink",
                marketMode === "normal" && "neon-cyan",
              )}
            >
              {marketMode === "bull" && "🚀 Bull"}
              {marketMode === "bear" && "🐻 Bear"}
              {marketMode === "normal" && "⚡ Normal"}
            </div>
            <button
              type="button"
              onClick={() => onNavigate("settings")}
              className="text-xs text-muted-foreground mt-1 hover:text-primary transition-colors flex items-center gap-1"
            >
              Change mode <ArrowRight className="w-3 h-3" />
            </button>
          </div>
        </motion.div>
      </motion.div>

      {/* Main Grid */}
      <div className="grid lg:grid-cols-3 gap-6">
        {/* All Coins */}
        <motion.div
          variants={container}
          initial="hidden"
          animate="show"
          className="lg:col-span-2"
        >
          <div className="glass-card p-4">
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-display font-bold text-base neon-cyan">
                Live Prices
              </h2>
              <button
                type="button"
                onClick={() => onNavigate("trade")}
                className="text-xs text-muted-foreground hover:text-primary transition-colors flex items-center gap-1"
              >
                Trade <ArrowRight className="w-3 h-3" />
              </button>
            </div>
            <div className="space-y-1">
              {priceList.map((coin) => (
                <CoinRow key={coin.symbol} coin={coin} />
              ))}
            </div>
          </div>
        </motion.div>

        {/* Right Column */}
        <div className="space-y-4">
          {/* Top Movers */}
          <motion.div variants={container} initial="hidden" animate="show">
            <div className="glass-card-purple p-4">
              <h2 className="font-display font-bold text-base neon-purple mb-3">
                🔥 Top Movers
              </h2>
              <div className="space-y-2">
                {topMovers.map((coin) => {
                  const up = coin.changePercent24h >= 0;
                  return (
                    <motion.div
                      key={coin.symbol}
                      variants={item}
                      className="flex items-center justify-between p-2 rounded-lg bg-muted/20"
                    >
                      <div className="flex items-center gap-2">
                        <CoinIcon symbol={coin.symbol} size={20} />
                        <span className="font-mono font-bold text-sm">
                          {coin.symbol}
                        </span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        {up ? (
                          <TrendingUp className="w-3 h-3 text-neon-green" />
                        ) : (
                          <TrendingDown className="w-3 h-3 text-neon-pink" />
                        )}
                        <span
                          className={cn(
                            "text-xs font-mono font-bold",
                            up ? "price-up" : "price-down",
                          )}
                        >
                          {up ? "+" : ""}
                          {coin.changePercent24h.toFixed(2)}%
                        </span>
                      </div>
                    </motion.div>
                  );
                })}
              </div>
            </div>
          </motion.div>

          {/* Trending by Volume */}
          <motion.div variants={container} initial="hidden" animate="show">
            <div className="glass-card-green p-4">
              <h2 className="font-display font-bold text-base neon-green mb-3">
                📊 Volume Leaders
              </h2>
              <div className="space-y-2">
                {trending.map((coin, i) => (
                  <motion.div
                    key={coin.symbol}
                    variants={item}
                    className="flex items-center justify-between p-2 rounded-lg bg-muted/20"
                  >
                    <div className="flex items-center gap-2">
                      <span className="text-xs text-muted-foreground font-mono">
                        #{i + 1}
                      </span>
                      <CoinIcon symbol={coin.symbol} size={20} />
                      <span className="font-mono font-bold text-sm">
                        {coin.symbol}
                      </span>
                    </div>
                    <span className="text-xs text-muted-foreground font-mono">
                      {formatCompact(coin.volume24h)}
                    </span>
                  </motion.div>
                ))}
              </div>
            </div>
          </motion.div>

          {/* Quick Actions */}
          <motion.div variants={item} initial="hidden" animate="show">
            <div className="glass-card p-4">
              <h2 className="font-display font-bold text-base text-foreground mb-3">
                Quick Actions
              </h2>
              <div className="grid grid-cols-2 gap-2">
                {[
                  {
                    label: "Buy Crypto",
                    page: "trade" as const,
                    icon: TrendingUp,
                    color: "neon-cyan",
                  },
                  {
                    label: "My Portfolio",
                    page: "portfolio" as const,
                    icon: Wallet,
                    color: "neon-purple",
                  },
                  {
                    label: "Set Alert",
                    page: "alerts" as const,
                    icon: Activity,
                    color: "neon-green",
                  },
                  {
                    label: "Learn",
                    page: "academy" as const,
                    icon: Zap,
                    color: "neon-pink",
                  },
                ].map((action) => {
                  const Icon = action.icon;
                  return (
                    <button
                      type="button"
                      key={action.page}
                      onClick={() => onNavigate(action.page)}
                      className="glass-card p-3 flex flex-col items-center gap-1.5 hover:bg-primary/10 hover:border-primary/40 transition-all group"
                    >
                      <Icon
                        className={cn(
                          "w-5 h-5 transition-colors",
                          "group-hover:text-primary",
                        )}
                      />
                      <span className="text-xs text-muted-foreground group-hover:text-foreground">
                        {action.label}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
