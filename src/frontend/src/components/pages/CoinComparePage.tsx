import { cn } from "@/lib/utils";
import { GitCompare, Trophy } from "lucide-react";
import { motion } from "motion/react";
import { useState } from "react";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import type { CoinPrice } from "../../hooks/usePrices";
import type { Page } from "../../types/navigation";
import CoinIcon from "../CoinIcon";
import TiltCard from "../TiltCard";

interface CoinComparePageProps {
  prices: Record<string, CoinPrice>;
  priceList: CoinPrice[];
  userData?: unknown;
  onNavigate: (page: Page) => void;
}

function formatUSD(n: number) {
  if (n >= 1)
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      maximumFractionDigits: 2,
    }).format(n);
  return `$${n.toFixed(4)}`;
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
        `${(i / (data.length - 1)) * 80},${50 - ((v - min) / range) * 50}`,
    )
    .join(" ");

  return (
    <svg
      viewBox="0 0 80 50"
      className="w-20 h-10"
      preserveAspectRatio="none"
      aria-hidden="true"
    >
      <polyline
        points={points}
        fill="none"
        stroke={up ? "oklch(0.82 0.2 150)" : "oklch(0.72 0.22 330)"}
        strokeWidth="2.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

const CustomTooltip = ({
  active,
  payload,
}: {
  active?: boolean;
  payload?: Array<{ value: number; payload: { name: string } }>;
}) => {
  if (active && payload && payload.length) {
    return (
      <div className="glass-liquid p-3 text-sm font-mono">
        <div className="font-bold text-foreground">
          {payload[0].payload.name}
        </div>
        <div
          className={cn(
            payload[0].value >= 0 ? "text-neon-green" : "text-neon-pink",
          )}
        >
          {payload[0].value >= 0 ? "+" : ""}
          {payload[0].value.toFixed(2)}%
        </div>
      </div>
    );
  }
  return null;
};

export default function CoinComparePage({ priceList }: CoinComparePageProps) {
  const [selected, setSelected] = useState<string[]>(["BTC", "ETH"]);

  const toggleCoin = (symbol: string) => {
    setSelected((prev) => {
      if (prev.includes(symbol)) {
        return prev.filter((s) => s !== symbol);
      }
      if (prev.length >= 3) {
        // Replace oldest (first)
        return [...prev.slice(1), symbol];
      }
      return [...prev, symbol];
    });
  };

  const selectedCoins = priceList.filter((c) => selected.includes(c.symbol));

  // Find best performer
  const bestPerformer =
    selectedCoins.length > 0
      ? selectedCoins.reduce((best, c) =>
          c.changePercent24h > best.changePercent24h ? c : best,
        )
      : null;

  const barData = selectedCoins.map((c) => ({
    name: c.symbol,
    change: c.changePercent24h,
    color: c.color,
  }));

  const COIN_COLORS = [
    "oklch(0.85 0.18 195)",
    "oklch(0.65 0.25 285)",
    "oklch(0.82 0.2 150)",
  ];

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
      >
        <div className="flex items-center gap-3">
          <div
            className="w-10 h-10 rounded-xl flex items-center justify-center glass-liquid"
            style={{ boxShadow: "0 0 20px oklch(0.82 0.2 150 / 0.3)" }}
          >
            <GitCompare
              className="w-5 h-5"
              style={{ color: "oklch(0.82 0.2 150)" }}
            />
          </div>
          <div>
            <h1 className="font-display text-2xl lg:text-3xl font-bold gradient-text-holo">
              Compare Coins
            </h1>
            <p className="text-muted-foreground text-sm mt-0.5">
              Select up to 3 coins to compare
            </p>
          </div>
        </div>
      </motion.div>

      {/* Coin selector */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.1 }}
        className="flex flex-wrap gap-2"
      >
        {priceList.map((coin) => {
          const isSelected = selected.includes(coin.symbol);
          const selIdx = selected.indexOf(coin.symbol);
          const selColor = isSelected ? COIN_COLORS[selIdx] : null;

          return (
            <button
              type="button"
              key={coin.symbol}
              onClick={() => toggleCoin(coin.symbol)}
              className={cn(
                "flex items-center gap-2 px-3 py-2 rounded-xl text-sm font-mono font-semibold transition-all border",
                isSelected
                  ? "text-foreground"
                  : "glass-card text-muted-foreground hover:text-foreground border-transparent",
              )}
              style={
                isSelected && selColor
                  ? {
                      background: `${selColor.replace(")", " / 0.15)")}`,
                      borderColor: `${selColor.replace(")", " / 0.5)")}`,
                      boxShadow: `0 0 12px ${selColor.replace(")", " / 0.25)")}`,
                      color: selColor,
                    }
                  : undefined
              }
            >
              <CoinIcon symbol={coin.symbol} size={18} />
              {coin.symbol}
              {isSelected && (
                <span
                  className="text-[10px] font-bold w-4 h-4 rounded-full flex items-center justify-center"
                  style={{
                    background: selColor ?? "transparent",
                    color: "oklch(0.06 0.02 270)",
                  }}
                >
                  {selIdx + 1}
                </span>
              )}
            </button>
          );
        })}
      </motion.div>

      {selectedCoins.length < 2 ? (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="glass-liquid p-12 text-center space-y-2"
        >
          <GitCompare className="w-12 h-12 mx-auto opacity-20" />
          <p className="text-muted-foreground">
            Select at least 2 coins to compare
          </p>
        </motion.div>
      ) : (
        <div className="space-y-6">
          {/* Comparison table */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.15 }}
          >
            <div className="glass-liquid glass-refract p-5">
              <h2 className="font-display font-bold text-base neon-cyan mb-4">
                Side by Side
              </h2>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="text-xs text-muted-foreground font-mono uppercase tracking-wider border-b border-border/40">
                      <th className="text-left pb-3 pr-4">Metric</th>
                      {selectedCoins.map((c, i) => (
                        <th
                          key={c.symbol}
                          className="text-right pb-3 px-3"
                          style={{ color: COIN_COLORS[i] }}
                        >
                          <div className="flex items-center justify-end gap-1.5">
                            <CoinIcon symbol={c.symbol} size={16} />
                            {c.symbol}
                            {bestPerformer?.symbol === c.symbol && (
                              <Trophy
                                className="w-3.5 h-3.5"
                                style={{ color: "oklch(0.78 0.2 55)" }}
                              />
                            )}
                          </div>
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border/20">
                    {[
                      {
                        label: "Price",
                        getValue: (c: CoinPrice) => formatUSD(c.price),
                      },
                      {
                        label: "24h Change",
                        getValue: (c: CoinPrice) => {
                          const up = c.changePercent24h >= 0;
                          return (
                            <span className={up ? "price-up" : "price-down"}>
                              {up ? "+" : ""}
                              {c.changePercent24h.toFixed(2)}%
                            </span>
                          );
                        },
                      },
                      {
                        label: "Market Cap",
                        getValue: (c: CoinPrice) => formatCompact(c.marketCap),
                      },
                      {
                        label: "24h Volume",
                        getValue: (c: CoinPrice) => formatCompact(c.volume24h),
                      },
                      {
                        label: "7D Sparkline",
                        getValue: (c: CoinPrice) => (
                          <div className="flex justify-end">
                            <SparkLine
                              data={c.history}
                              up={c.changePercent24h >= 0}
                            />
                          </div>
                        ),
                      },
                    ].map((row) => (
                      <tr
                        key={row.label}
                        className="hover:bg-muted/10 transition-colors"
                      >
                        <td className="py-3 pr-4 text-muted-foreground font-mono text-xs">
                          {row.label}
                        </td>
                        {selectedCoins.map((c) => (
                          <td
                            key={c.symbol}
                            className="py-3 px-3 text-right font-mono font-medium text-sm"
                          >
                            {row.getValue(c)}
                          </td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </motion.div>

          {/* Bar chart - 24h performance */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.25 }}
          >
            <div className="glass-liquid glass-refract p-5">
              <h2 className="font-display font-bold text-base neon-purple mb-4">
                24h Performance Comparison
              </h2>
              <ResponsiveContainer width="100%" height={200}>
                <BarChart
                  data={barData}
                  margin={{ top: 10, right: 20, bottom: 5, left: 10 }}
                >
                  <CartesianGrid
                    strokeDasharray="3 3"
                    stroke="oklch(0.25 0.04 265 / 0.5)"
                  />
                  <XAxis
                    dataKey="name"
                    tick={{
                      fill: "oklch(0.55 0.05 230)",
                      fontSize: 12,
                      fontFamily: "JetBrains Mono, monospace",
                    }}
                    axisLine={false}
                    tickLine={false}
                  />
                  <YAxis
                    tickFormatter={(v) => `${v > 0 ? "+" : ""}${v.toFixed(1)}%`}
                    tick={{
                      fill: "oklch(0.55 0.05 230)",
                      fontSize: 11,
                      fontFamily: "JetBrains Mono, monospace",
                    }}
                    axisLine={false}
                    tickLine={false}
                  />
                  <Tooltip content={<CustomTooltip />} />
                  <Bar dataKey="change" radius={[6, 6, 0, 0]} maxBarSize={60}>
                    {barData.map((entry) => (
                      <Cell
                        key={`cell-${entry.name}`}
                        fill={
                          entry.change >= 0
                            ? "oklch(0.82 0.2 150)"
                            : "oklch(0.72 0.22 330)"
                        }
                        opacity={0.85}
                      />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </motion.div>

          {/* Coin detail cards */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
            className="grid md:grid-cols-3 gap-4"
          >
            {selectedCoins.map((c, i) => {
              const up = c.changePercent24h >= 0;
              const isWinner = bestPerformer?.symbol === c.symbol;
              return (
                <TiltCard key={c.symbol}>
                  <div
                    className="glass-liquid glass-refract p-4 space-y-3 h-full"
                    style={{
                      borderColor: isWinner
                        ? "oklch(0.78 0.2 55 / 0.5)"
                        : `${COIN_COLORS[i].replace(")", " / 0.3)")}`,
                    }}
                  >
                    {isWinner && (
                      <div
                        className="flex items-center gap-1 text-[10px] font-mono font-bold"
                        style={{ color: "oklch(0.78 0.2 55)" }}
                      >
                        <Trophy className="w-3 h-3" />
                        BEST PERFORMER
                      </div>
                    )}
                    <div className="flex items-center gap-2">
                      <div
                        className="w-10 h-10 rounded-full flex items-center justify-center glass-card overflow-hidden"
                        style={{ boxShadow: `0 0 12px ${c.color}40` }}
                      >
                        <CoinIcon symbol={c.symbol} size={32} />
                      </div>
                      <div>
                        <div
                          className="font-mono font-bold text-lg"
                          style={{ color: COIN_COLORS[i] }}
                        >
                          {c.symbol}
                        </div>
                        <div className="text-xs text-muted-foreground">
                          {c.name}
                        </div>
                      </div>
                    </div>
                    <div>
                      <div className="font-display font-bold text-xl">
                        {formatUSD(c.price)}
                      </div>
                      <div
                        className={cn(
                          "text-sm font-mono",
                          up ? "price-up" : "price-down",
                        )}
                      >
                        {up ? "+" : ""}
                        {c.changePercent24h.toFixed(2)}%
                      </div>
                    </div>
                    <SparkLine data={c.history} up={up} />
                  </div>
                </TiltCard>
              );
            })}
          </motion.div>
        </div>
      )}
    </div>
  );
}
