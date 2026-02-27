import { ScrollArea } from "@/components/ui/scroll-area";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";
import { Clock, TrendingDown, TrendingUp, Wallet } from "lucide-react";
import { motion } from "motion/react";
import type { Trade, UserDataView } from "../../backend.d";
import { TradeSide } from "../../backend.d";
import type { CoinPrice } from "../../hooks/usePrices";
import type { Page } from "../../types/navigation";
import CoinIcon from "../CoinIcon";

interface PortfolioProps {
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

const container = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { staggerChildren: 0.06 } },
};

const item = {
  hidden: { opacity: 0, y: 16 },
  show: { opacity: 1, y: 0, transition: { duration: 0.35 } },
};

export default function Portfolio({
  prices,
  priceList,
  userData,
  onNavigate,
}: PortfolioProps) {
  const holdings = Array.isArray(userData?.portfolio) ? userData.portfolio : [];
  const tradeHistory = userData?.tradeHistory ?? [];

  const portfolioWithPnL = holdings
    .map((h: { coin: string; quantity: number }) => {
      const coinData = prices[h.coin];
      const currentValue = h.quantity * (coinData?.price ?? 0);
      const lastBuy = [...tradeHistory]
        .filter((t: Trade) => t.coin === h.coin && t.side === TradeSide.buy)
        .sort(
          (a: Trade, b: Trade) => Number(b.timestamp) - Number(a.timestamp),
        )[0];
      const avgBuyPrice = lastBuy
        ? lastBuy.price
        : (coinData?.price ?? 0) * 0.95;
      const costBasis = h.quantity * avgBuyPrice;
      const pnl = currentValue - costBasis;
      const pnlPercent = costBasis > 0 ? (pnl / costBasis) * 100 : 0;
      return {
        ...h,
        currentPrice: coinData?.price ?? 0,
        currentValue,
        costBasis,
        pnl,
        pnlPercent,
        coin: coinData,
      };
    })
    .filter((h: { currentValue: number }) => h.currentValue > 0);

  const totalInvested = portfolioWithPnL.reduce(
    (s: number, h: { costBasis: number }) => s + h.costBasis,
    0,
  );
  const totalValue = portfolioWithPnL.reduce(
    (s: number, h: { currentValue: number }) => s + h.currentValue,
    0,
  );
  const totalPnL = totalValue - totalInvested;
  const totalPnLPercent =
    totalInvested > 0 ? (totalPnL / totalInvested) * 100 : 0;

  const cashBalance = userData?.balance ?? 10000;
  const grandTotal = totalValue + cashBalance;

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <h1 className="font-display text-2xl lg:text-3xl font-bold gradient-text-holo">
          Portfolio
        </h1>
        <p className="text-muted-foreground text-sm mt-1">
          Track your holdings and performance
        </p>
      </motion.div>

      {/* Summary Cards */}
      <motion.div
        variants={container}
        initial="hidden"
        animate="show"
        className="grid grid-cols-2 lg:grid-cols-4 gap-4"
      >
        <motion.div variants={item} className="col-span-2 lg:col-span-1">
          <div className="glass-card neon-border-cyan p-4">
            <div className="text-xs text-muted-foreground mb-1">
              Total Value
            </div>
            <div className="font-display font-bold text-2xl neon-cyan">
              {formatUSD(grandTotal)}
            </div>
          </div>
        </motion.div>
        <motion.div variants={item}>
          <div className="glass-card p-4">
            <div className="text-xs text-muted-foreground mb-1">
              Cash Balance
            </div>
            <div className="font-display font-bold text-lg text-foreground">
              {formatUSD(cashBalance)}
            </div>
          </div>
        </motion.div>
        <motion.div variants={item}>
          <div className="glass-card p-4">
            <div className="text-xs text-muted-foreground mb-1">
              Invested Value
            </div>
            <div className="font-display font-bold text-lg text-foreground">
              {formatUSD(totalValue)}
            </div>
          </div>
        </motion.div>
        <motion.div variants={item}>
          <div
            className={cn(
              "glass-card p-4",
              totalPnL >= 0 ? "neon-border-green" : "border-destructive/40",
            )}
          >
            <div className="text-xs text-muted-foreground mb-1">Total P&L</div>
            <div
              className={cn(
                "font-display font-bold text-lg",
                totalPnL >= 0 ? "neon-green" : "neon-pink",
              )}
            >
              {totalPnL >= 0 ? "+" : ""}
              {formatUSD(totalPnL)}
            </div>
            <div
              className={cn(
                "text-xs font-mono",
                totalPnL >= 0 ? "price-up" : "price-down",
              )}
            >
              {totalPnLPercent >= 0 ? "+" : ""}
              {totalPnLPercent.toFixed(2)}%
            </div>
          </div>
        </motion.div>
      </motion.div>

      <div className="grid lg:grid-cols-2 gap-6">
        {/* Holdings */}
        <motion.div variants={container} initial="hidden" animate="show">
          <div className="glass-card p-4 h-full">
            <h2 className="font-display font-bold text-base neon-cyan mb-4 flex items-center gap-2">
              <Wallet className="w-4 h-4" /> Holdings
            </h2>
            {portfolioWithPnL.length === 0 ? (
              <div className="text-center py-12 text-muted-foreground">
                <Wallet className="w-10 h-10 mx-auto mb-3 opacity-30" />
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
                {portfolioWithPnL.map(
                  (h: {
                    coin: CoinPrice | undefined;
                    symbol?: string;
                    quantity: number;
                    currentPrice: number;
                    currentValue: number;
                    pnl: number;
                    pnlPercent: number;
                  }) => {
                    const up = h.pnl >= 0;
                    const coinInfo =
                      h.coin ??
                      priceList.find((c) => c.symbol === h.coin?.symbol);
                    return (
                      <motion.div
                        key={`holding-${coinInfo?.symbol ?? Math.random()}`}
                        variants={item}
                        className="flex items-center gap-3 p-3 rounded-lg hover:bg-muted/20 transition-all"
                      >
                        <div
                          className="w-8 h-8 rounded-full flex items-center justify-center coin-3d overflow-hidden glass-card"
                          style={{
                            boxShadow: `0 0 8px ${coinInfo?.color ?? ""}30`,
                          }}
                        >
                          {coinInfo?.symbol ? (
                            <CoinIcon symbol={coinInfo.symbol} size={26} />
                          ) : null}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="font-mono font-bold text-sm">
                            {coinInfo?.symbol}
                          </div>
                          <div className="text-xs text-muted-foreground font-mono">
                            {(h.quantity ?? 0).toFixed(6)} @{" "}
                            {formatUSD(h.currentPrice)}
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="font-mono font-bold text-sm">
                            {formatUSD(h.currentValue)}
                          </div>
                          <div
                            className={cn(
                              "text-xs font-mono flex items-center justify-end gap-0.5",
                              up ? "price-up" : "price-down",
                            )}
                          >
                            {up ? (
                              <TrendingUp className="w-3 h-3" />
                            ) : (
                              <TrendingDown className="w-3 h-3" />
                            )}
                            {up ? "+" : ""}
                            {h.pnlPercent.toFixed(2)}%
                          </div>
                        </div>
                      </motion.div>
                    );
                  },
                )}
              </div>
            )}
          </div>
        </motion.div>

        {/* Trade History */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0, transition: { delay: 0.2 } }}
        >
          <div className="glass-card p-4 h-full">
            <h2 className="font-display font-bold text-base neon-purple mb-4 flex items-center gap-2">
              <Clock className="w-4 h-4" /> Trade History
            </h2>
            {tradeHistory.length === 0 ? (
              <div className="text-center py-12 text-muted-foreground">
                <Clock className="w-10 h-10 mx-auto mb-3 opacity-30" />
                <p className="text-sm">No trades yet.</p>
              </div>
            ) : (
              <ScrollArea className="h-80">
                <div className="space-y-2 pr-2">
                  {[...tradeHistory]
                    .sort(
                      (a: Trade, b: Trade) =>
                        Number(b.timestamp) - Number(a.timestamp),
                    )
                    .map((trade: Trade, i: number) => {
                      const isBuy = trade.side === TradeSide.buy;
                      const coinData = prices[trade.coin];
                      return (
                        <div
                          key={`trade-${i}-${Number(trade.timestamp)}`}
                          className="flex items-center gap-3 p-2.5 rounded-lg bg-muted/20 text-sm"
                        >
                          <div
                            className={cn(
                              "w-7 h-7 rounded-full flex items-center justify-center",
                              isBuy ? "bg-primary/20" : "bg-destructive/20",
                            )}
                          >
                            {isBuy ? (
                              <TrendingUp className="w-3.5 h-3.5 text-primary" />
                            ) : (
                              <TrendingDown className="w-3.5 h-3.5 text-destructive" />
                            )}
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="font-mono font-bold text-xs">
                              {isBuy ? "BUY" : "SELL"}{" "}
                              <span style={{ color: coinData?.color }}>
                                {trade.coin}
                              </span>
                            </div>
                            <div className="text-xs text-muted-foreground">
                              {formatTime(trade.timestamp)}
                            </div>
                          </div>
                          <div className="text-right">
                            <div className="font-mono text-xs font-bold">
                              {formatUSD(trade.totalValue)}
                            </div>
                            <div className="text-xs text-muted-foreground font-mono">
                              {trade.quantity.toFixed(4)} @{" "}
                              {formatUSD(trade.price)}
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
