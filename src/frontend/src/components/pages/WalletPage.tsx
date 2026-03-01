import { ScrollArea } from "@/components/ui/scroll-area";
import { cn } from "@/lib/utils";
import {
  ArrowDownLeft,
  ArrowUpRight,
  Clock,
  DollarSign,
  PiggyBank,
  TrendingDown,
  TrendingUp,
  Wallet,
} from "lucide-react";
import { type Variants, motion } from "motion/react";
import type { Trade, UserDataView } from "../../backend.d";
import { TradeSide } from "../../backend.d";
import type { CoinPrice } from "../../hooks/usePrices";
import type { Page } from "../../types/navigation";
import CoinIcon from "../CoinIcon";
import TiltCard from "../TiltCard";

interface WalletPageProps {
  prices: Record<string, CoinPrice>;
  priceList: CoinPrice[];
  userData?: UserDataView;
  onNavigate: (page: Page) => void;
}

function formatUSD(n: number) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 2,
  }).format(n);
}

function formatTime(ts: bigint) {
  const ms = Number(ts) / 1_000_000;
  return new Date(ms).toLocaleString("en-US", {
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

const container: Variants = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { staggerChildren: 0.08 } },
};

const item: Variants = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0, transition: { duration: 0.4, ease: "easeOut" } },
};

export default function WalletPage({
  prices,
  userData,
  onNavigate,
}: WalletPageProps) {
  const holdings = Array.isArray(userData?.portfolio) ? userData.portfolio : [];
  const tradeHistory = userData?.tradeHistory ?? [];

  // Per-coin P&L calculation
  const coinPnL = holdings.map((h) => {
    const currentPrice = prices[h.coin]?.price ?? 0;
    const currentValue = h.quantity * currentPrice;

    // Calculate average buy price from trade history
    const buys = tradeHistory.filter(
      (t: Trade) => t.coin === h.coin && t.side === TradeSide.buy,
    );
    const totalBuyValue = buys.reduce(
      (s: number, t: Trade) => s + t.totalValue,
      0,
    );
    const totalBuyQty = buys.reduce((s: number, t: Trade) => s + t.quantity, 0);
    const sells = tradeHistory.filter(
      (t: Trade) => t.coin === h.coin && t.side === TradeSide.sell,
    );
    const totalSellQty = sells.reduce(
      (s: number, t: Trade) => s + t.quantity,
      0,
    );
    const avgBuyPrice =
      totalBuyQty > 0 ? totalBuyValue / totalBuyQty : currentPrice;
    const costBasis = h.quantity * avgBuyPrice;
    const pnl = currentValue - costBasis;
    const pnlPercent = costBasis > 0 ? (pnl / costBasis) * 100 : 0;

    return {
      ...h,
      currentPrice,
      currentValue,
      avgBuyPrice,
      costBasis,
      pnl,
      pnlPercent,
      totalBuyQty,
      totalSellQty,
      coinData: prices[h.coin],
    };
  });

  const totalHoldingsValue = coinPnL.reduce((s, h) => s + h.currentValue, 0);
  const totalInvested = coinPnL.reduce((s, h) => s + h.costBasis, 0);
  const totalPnL = coinPnL.reduce((s, h) => s + h.pnl, 0);
  const totalPnLPercent =
    totalInvested > 0 ? (totalPnL / totalInvested) * 100 : 0;
  const cashBalance = userData?.balance ?? 10000;
  const netWorth = cashBalance + totalHoldingsValue;

  const sortedHistory = [...tradeHistory].sort(
    (a: Trade, b: Trade) => Number(b.timestamp) - Number(a.timestamp),
  );

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
      >
        <div className="flex items-center gap-3">
          <div
            className="w-10 h-10 rounded-xl flex items-center justify-center glass-liquid"
            style={{ boxShadow: "0 0 20px oklch(0.85 0.18 195 / 0.3)" }}
          >
            <PiggyBank
              className="w-5 h-5"
              style={{ color: "oklch(0.85 0.18 195)" }}
            />
          </div>
          <div>
            <h1 className="font-display text-2xl lg:text-3xl font-bold gradient-text-holo">
              Wallet
            </h1>
            <p className="text-muted-foreground text-sm mt-0.5">
              Your complete financial overview
            </p>
          </div>
        </div>
      </motion.div>

      {/* Summary Cards */}
      <motion.div
        variants={container}
        initial="hidden"
        animate="show"
        className="grid grid-cols-2 lg:grid-cols-4 gap-4"
      >
        {/* Net Worth */}
        <motion.div variants={item} className="col-span-2 lg:col-span-1">
          <TiltCard>
            <div className="glass-liquid glass-refract neon-border-cyan p-5 h-full">
              <div className="flex items-start justify-between mb-3">
                <div className="text-xs text-muted-foreground uppercase tracking-wider font-mono">
                  Net Worth
                </div>
                <Wallet
                  className="w-4 h-4"
                  style={{ color: "oklch(0.85 0.18 195)" }}
                />
              </div>
              <div className="font-display font-bold text-2xl neon-cyan">
                {formatUSD(netWorth)}
              </div>
              <div className="text-xs text-muted-foreground mt-1 font-mono">
                All assets combined
              </div>
            </div>
          </TiltCard>
        </motion.div>

        {/* Cash Balance */}
        <motion.div variants={item}>
          <TiltCard>
            <div className="glass-liquid glass-refract p-4 h-full">
              <div className="flex items-start justify-between mb-3">
                <div className="text-xs text-muted-foreground uppercase tracking-wider font-mono">
                  Cash
                </div>
                <DollarSign
                  className="w-4 h-4"
                  style={{ color: "oklch(0.65 0.25 285)" }}
                />
              </div>
              <div className="font-display font-bold text-xl neon-purple">
                {formatUSD(cashBalance)}
              </div>
              <div className="text-xs text-muted-foreground mt-1 font-mono">
                Available to trade
              </div>
            </div>
          </TiltCard>
        </motion.div>

        {/* Total Invested */}
        <motion.div variants={item}>
          <TiltCard>
            <div className="glass-liquid glass-refract p-4 h-full">
              <div className="flex items-start justify-between mb-3">
                <div className="text-xs text-muted-foreground uppercase tracking-wider font-mono">
                  Invested
                </div>
                <TrendingUp
                  className="w-4 h-4"
                  style={{ color: "oklch(0.82 0.2 150)" }}
                />
              </div>
              <div className="font-display font-bold text-xl neon-green">
                {formatUSD(totalHoldingsValue)}
              </div>
              <div className="text-xs text-muted-foreground mt-1 font-mono">
                Cost: {formatUSD(totalInvested)}
              </div>
            </div>
          </TiltCard>
        </motion.div>

        {/* P&L */}
        <motion.div variants={item}>
          <TiltCard>
            <div
              className={cn(
                "glass-liquid glass-refract p-4 h-full",
                totalPnL >= 0 ? "neon-border-green" : "border-destructive/40",
              )}
            >
              <div className="flex items-start justify-between mb-3">
                <div className="text-xs text-muted-foreground uppercase tracking-wider font-mono">
                  Total P&L
                </div>
                {totalPnL >= 0 ? (
                  <TrendingUp
                    className="w-4 h-4"
                    style={{ color: "oklch(0.82 0.2 150)" }}
                  />
                ) : (
                  <TrendingDown
                    className="w-4 h-4"
                    style={{ color: "oklch(0.72 0.22 330)" }}
                  />
                )}
              </div>
              <div
                className={cn(
                  "font-display font-bold text-xl",
                  totalPnL >= 0 ? "neon-green" : "neon-pink",
                )}
              >
                {totalPnL >= 0 ? "+" : ""}
                {formatUSD(totalPnL)}
              </div>
              <div
                className={cn(
                  "text-xs font-mono mt-1",
                  totalPnL >= 0 ? "price-up" : "price-down",
                )}
              >
                {totalPnLPercent >= 0 ? "+" : ""}
                {totalPnLPercent.toFixed(2)}%
              </div>
            </div>
          </TiltCard>
        </motion.div>
      </motion.div>

      <div className="grid lg:grid-cols-5 gap-6">
        {/* Per-Coin P&L Table */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.2 }}
          className="lg:col-span-3"
        >
          <div className="glass-liquid glass-refract p-5 h-full">
            <h2 className="font-display font-bold text-base neon-cyan mb-4 flex items-center gap-2">
              <Wallet className="w-4 h-4" />
              Holdings Breakdown
            </h2>

            {coinPnL.length === 0 ? (
              <div className="text-center py-10 text-muted-foreground">
                <Wallet className="w-10 h-10 mx-auto mb-3 opacity-20" />
                <p className="text-sm">No holdings yet.</p>
                <button
                  type="button"
                  onClick={() => onNavigate("trade")}
                  className="mt-2 text-primary text-sm hover:underline"
                >
                  Start trading →
                </button>
              </div>
            ) : (
              <div className="space-y-2">
                {/* Table header */}
                <div className="grid grid-cols-5 gap-2 px-3 py-1.5 text-xs text-muted-foreground font-mono uppercase tracking-wider">
                  <div className="col-span-2">Coin</div>
                  <div className="text-right">Qty</div>
                  <div className="text-right">Value</div>
                  <div className="text-right">P&L</div>
                </div>

                {coinPnL.map((h) => {
                  const up = h.pnl >= 0;
                  return (
                    <TiltCard key={h.coin} maxTilt={3}>
                      <div className="glass-card grid grid-cols-5 gap-2 p-3 items-center hover:border-primary/30 transition-all">
                        <div className="col-span-2 flex items-center gap-2 min-w-0">
                          <div
                            className="w-8 h-8 rounded-full flex items-center justify-center overflow-hidden flex-shrink-0"
                            style={{
                              boxShadow: `0 0 8px ${h.coinData?.color ?? ""}30`,
                            }}
                          >
                            <CoinIcon symbol={h.coin} size={26} />
                          </div>
                          <div className="min-w-0">
                            <div className="font-mono font-bold text-sm truncate">
                              {h.coin}
                            </div>
                            <div className="text-xs text-muted-foreground">
                              @ {formatUSD(h.currentPrice)}
                            </div>
                          </div>
                        </div>
                        <div className="text-right font-mono text-xs text-muted-foreground">
                          {h.quantity.toFixed(4)}
                        </div>
                        <div className="text-right font-mono font-bold text-sm">
                          {formatUSD(h.currentValue)}
                        </div>
                        <div className="text-right">
                          <div
                            className={cn(
                              "font-mono font-bold text-xs",
                              up ? "price-up" : "price-down",
                            )}
                          >
                            {up ? "+" : ""}
                            {h.pnlPercent.toFixed(1)}%
                          </div>
                          <div
                            className={cn(
                              "text-xs font-mono",
                              up ? "price-up" : "price-down",
                            )}
                          >
                            {up ? "+" : ""}
                            {formatUSD(h.pnl)}
                          </div>
                        </div>
                      </div>
                    </TiltCard>
                  );
                })}
              </div>
            )}
          </div>
        </motion.div>

        {/* Transaction History */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.3 }}
          className="lg:col-span-2"
        >
          <div className="glass-liquid glass-refract p-5 h-full">
            <h2 className="font-display font-bold text-base neon-purple mb-4 flex items-center gap-2">
              <Clock className="w-4 h-4" />
              Transaction History
            </h2>

            {sortedHistory.length === 0 ? (
              <div className="text-center py-10 text-muted-foreground">
                <Clock className="w-8 h-8 mx-auto mb-3 opacity-20" />
                <p className="text-sm">No transactions yet.</p>
              </div>
            ) : (
              <ScrollArea className="h-96 lg:h-[500px]">
                <div className="space-y-2 pr-2">
                  {sortedHistory.map((trade: Trade, i: number) => {
                    const isBuy = trade.side === TradeSide.buy;
                    const coinData = prices[trade.coin];
                    return (
                      <div
                        key={`txn-${i}-${Number(trade.timestamp)}`}
                        className="glass-card p-3 flex items-center gap-3 hover:border-primary/20 transition-all"
                      >
                        <div
                          className={cn(
                            "w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0",
                            isBuy
                              ? "bg-primary/15 border border-primary/30"
                              : "bg-destructive/15 border border-destructive/30",
                          )}
                        >
                          {isBuy ? (
                            <ArrowUpRight className="w-4 h-4 text-primary" />
                          ) : (
                            <ArrowDownLeft className="w-4 h-4 text-destructive" />
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-1.5">
                            <CoinIcon symbol={trade.coin} size={14} />
                            <span
                              className="font-mono font-bold text-xs"
                              style={{ color: coinData?.color }}
                            >
                              {trade.coin}
                            </span>
                            <span
                              className={cn(
                                "text-[10px] font-mono font-bold px-1 rounded",
                                isBuy
                                  ? "bg-primary/15 text-primary"
                                  : "bg-destructive/15 text-destructive",
                              )}
                            >
                              {isBuy ? "BUY" : "SELL"}
                            </span>
                          </div>
                          <div className="text-[10px] text-muted-foreground font-mono">
                            {formatTime(trade.timestamp)}
                          </div>
                        </div>
                        <div className="text-right flex-shrink-0">
                          <div className="font-mono font-bold text-xs">
                            {formatUSD(trade.totalValue)}
                          </div>
                          <div className="text-[10px] text-muted-foreground font-mono">
                            {trade.quantity.toFixed(4)} units
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </ScrollArea>
            )}
          </div>
        </motion.div>
      </div>
    </div>
  );
}
