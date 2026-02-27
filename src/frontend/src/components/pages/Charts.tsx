import { cn } from "@/lib/utils";
import { motion } from "motion/react";
import { useMemo, useState } from "react";
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  ComposedChart,
  Line,
  LineChart,
  ReferenceLine,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import type { UserDataView } from "../../backend.d";
import type { CoinPrice } from "../../hooks/usePrices";
import type { Page } from "../../types/navigation";
import CoinIcon from "../CoinIcon";

interface ChartsProps {
  prices: Record<string, CoinPrice>;
  priceList: CoinPrice[];
  userData?: UserDataView;
  onNavigate: (page: Page) => void;
}

type ChartType = "line" | "area" | "volume" | "candle" | "rsi";

const CHART_TYPES: { id: ChartType; label: string }[] = [
  { id: "line", label: "Line" },
  { id: "area", label: "Area" },
  { id: "volume", label: "Volume" },
  { id: "candle", label: "Candle" },
  { id: "rsi", label: "RSI" },
];

function formatUSD(n: number) {
  if (n >= 1000) return `$${(n / 1000).toFixed(1)}k`;
  if (n >= 1) return `$${n.toFixed(2)}`;
  return `$${n.toFixed(4)}`;
}

// ── Data helpers ────────────────────────────────────────────────────────────

function buildVolumeData(history: number[]) {
  // Stable volume using index as seed (no random in render)
  return history.map((price, i) => {
    const seed = Math.sin(i * 127.1 + price * 0.001) * 0.5 + 0.5; // deterministic 0-1
    const volume = price * (0.8 + seed * 0.4) * 1000;
    const prevPrice = history[i - 1] ?? price;
    return {
      tick: i + 1,
      volume,
      up: price >= prevPrice,
    };
  });
}

interface OHLCCandle {
  tick: number;
  open: number;
  high: number;
  low: number;
  close: number;
  up: boolean;
  body: [number, number]; // [low of body, high of body] for bar
  wick: number; // high - low (full range)
  wickLow: number;
  midLow: number;
}

function buildCandleData(history: number[]): OHLCCandle[] {
  const GROUP = 5;
  const candles: OHLCCandle[] = [];
  for (let i = 0; i + GROUP <= history.length; i += GROUP) {
    const chunk = history.slice(i, i + GROUP);
    const open = chunk[0];
    const close = chunk[chunk.length - 1];
    const high = Math.max(...chunk);
    const low = Math.min(...chunk);
    const up = close >= open;
    const bodyLow = Math.min(open, close);
    const bodyHigh = Math.max(open, close);
    candles.push({
      tick: Math.floor(i / GROUP) + 1,
      open,
      high,
      low,
      close,
      up,
      body: [bodyLow, bodyHigh],
      wick: high - low,
      wickLow: low,
      midLow: bodyLow,
    });
  }
  return candles;
}

function computeRSI(
  prices: number[],
  period = 14,
): { tick: number; rsi: number }[] {
  if (prices.length < period + 1) return [];
  const result: { tick: number; rsi: number }[] = [];
  let avgGain = 0;
  let avgLoss = 0;

  for (let i = 1; i <= period; i++) {
    const change = prices[i] - prices[i - 1];
    if (change >= 0) avgGain += change;
    else avgLoss += Math.abs(change);
  }
  avgGain /= period;
  avgLoss /= period;

  for (let i = period; i < prices.length; i++) {
    if (i > period) {
      const change = prices[i] - prices[i - 1];
      const gain = change >= 0 ? change : 0;
      const loss = change < 0 ? Math.abs(change) : 0;
      avgGain = (avgGain * (period - 1) + gain) / period;
      avgLoss = (avgLoss * (period - 1) + loss) / period;
    }
    const rs = avgLoss === 0 ? 100 : avgGain / avgLoss;
    const rsi = 100 - 100 / (1 + rs);
    result.push({ tick: i + 1, rsi: Math.round(rsi * 100) / 100 });
  }
  return result;
}

// ── Tooltip components ───────────────────────────────────────────────────────

function PriceTooltip({
  active,
  payload,
  label,
  color,
}: {
  active?: boolean;
  payload?: Array<{ value: number }>;
  label?: string | number;
  color: string;
}) {
  if (!active || !payload?.length) return null;
  return (
    <div className="glass-card px-3 py-2 text-xs font-mono">
      <div className="text-muted-foreground mb-0.5">Tick {label}</div>
      <div style={{ color }} className="font-bold">
        {formatUSD(payload[0].value)}
      </div>
    </div>
  );
}

function VolumeTooltip({
  active,
  payload,
  label,
}: {
  active?: boolean;
  payload?: Array<{ value: number; payload: { up: boolean } }>;
  label?: string | number;
}) {
  if (!active || !payload?.length) return null;
  const up = payload[0].payload.up;
  return (
    <div className="glass-card px-3 py-2 text-xs font-mono">
      <div className="text-muted-foreground mb-0.5">Tick {label}</div>
      <div className={up ? "price-up" : "price-down"}>
        Vol: {(payload[0].value / 1000).toFixed(0)}K
      </div>
    </div>
  );
}

function CandleTooltip({
  active,
  payload,
  label,
}: {
  active?: boolean;
  payload?: Array<{ payload: OHLCCandle }>;
  label?: string | number;
}) {
  if (!active || !payload?.length) return null;
  const c = payload[0].payload;
  return (
    <div className="glass-card px-3 py-2 text-xs font-mono space-y-0.5">
      <div className="text-muted-foreground">Candle {label}</div>
      <div
        style={{ color: c.up ? "oklch(0.82 0.2 150)" : "oklch(0.72 0.22 330)" }}
      >
        O: {formatUSD(c.open)} | C: {formatUSD(c.close)}
      </div>
      <div className="text-muted-foreground">
        H: {formatUSD(c.high)} | L: {formatUSD(c.low)}
      </div>
    </div>
  );
}

function RSITooltip({
  active,
  payload,
  label,
}: {
  active?: boolean;
  payload?: Array<{ value: number }>;
  label?: string | number;
}) {
  if (!active || !payload?.length) return null;
  const v = payload[0].value;
  const color =
    v >= 70
      ? "oklch(0.72 0.22 330)"
      : v <= 30
        ? "oklch(0.82 0.2 150)"
        : "oklch(0.85 0.18 195)";
  return (
    <div className="glass-card px-3 py-2 text-xs font-mono">
      <div className="text-muted-foreground mb-0.5">Tick {label}</div>
      <div style={{ color }} className="font-bold">
        RSI: {v.toFixed(2)}
      </div>
      <div className="text-muted-foreground text-[10px]">
        {v >= 70 ? "Overbought" : v <= 30 ? "Oversold" : "Neutral"}
      </div>
    </div>
  );
}

// ── Custom candle shape ──────────────────────────────────────────────────────

interface CandleShapeProps {
  x?: number;
  y?: number;
  width?: number;
  height?: number;
  payload?: OHLCCandle;
  yAxis?: { scale: (v: number) => number };
}

function CandleShape({ x = 0, width = 0, payload, yAxis }: CandleShapeProps) {
  if (!payload || !yAxis) return null;
  const { open, close, high, low, up } = payload;
  const scale = yAxis.scale;
  const yHigh = scale(high);
  const yLow = scale(low);
  const yOpen = scale(open);
  const yClose = scale(close);
  const bodyTop = Math.min(yOpen, yClose);
  const bodyBot = Math.max(yOpen, yClose);
  const bodyH = Math.max(bodyBot - bodyTop, 1);
  const cx = x + width / 2;
  const color = up ? "oklch(0.82 0.2 150)" : "oklch(0.72 0.22 330)";

  return (
    <g>
      {/* Wick */}
      <line
        x1={cx}
        x2={cx}
        y1={yHigh}
        y2={yLow}
        stroke={color}
        strokeWidth={1}
        strokeOpacity={0.8}
      />
      {/* Body */}
      <rect
        x={x + 1}
        y={bodyTop}
        width={Math.max(width - 2, 1)}
        height={bodyH}
        fill={color}
        fillOpacity={up ? 0.85 : 0.7}
        stroke={color}
        strokeWidth={0.5}
      />
    </g>
  );
}

// ── Axis/chart style helpers ─────────────────────────────────────────────────

const AXIS_STYLE = {
  fill: "oklch(0.55 0.05 230)",
  fontSize: 10,
  fontFamily: "JetBrains Mono",
};
const GRID_STROKE = "oklch(0.25 0.06 265)";

// ── Main component ────────────────────────────────────────────────────────────

export default function Charts({ prices, priceList }: ChartsProps) {
  const [selectedSymbol, setSelectedSymbol] = useState<string>("BTC");
  const [chartType, setChartType] = useState<ChartType>("line");

  const coin = prices[selectedSymbol];
  const history = coin?.history ?? [];
  const currentPrice = coin?.price ?? 0;
  const up = (coin?.changePercent24h ?? 0) >= 0;
  const minPrice = history.length ? Math.min(...history) : 0;
  const maxPrice = history.length ? Math.max(...history) : 0;

  // Stable derived data (useMemo keyed on history reference)
  const lineData = useMemo(
    () => history.map((price, i) => ({ tick: i + 1, price })),
    [history],
  );

  const volumeData = useMemo(() => buildVolumeData(history), [history]);
  const candleData = useMemo(() => buildCandleData(history), [history]);
  const rsiData = useMemo(() => computeRSI(history), [history]);

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <h1 className="font-display text-2xl lg:text-3xl font-bold gradient-text-holo">
          Holo Charts
        </h1>
        <p className="text-muted-foreground text-sm mt-1">
          Simulated price history visualization
        </p>
      </motion.div>

      {/* Coin Selector */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1, transition: { delay: 0.1 } }}
        className="flex flex-wrap gap-2"
      >
        {priceList.map((c) => (
          <button
            type="button"
            key={c.symbol}
            onClick={() => setSelectedSymbol(c.symbol)}
            className={cn(
              "px-3 py-2 rounded-lg text-sm font-mono font-bold transition-all flex items-center gap-2",
              selectedSymbol === c.symbol
                ? "glass-card neon-border-cyan text-primary shadow-neon-cyan"
                : "glass-card text-muted-foreground hover:text-foreground hover:bg-muted/30",
            )}
            style={
              selectedSymbol === c.symbol
                ? { borderColor: c.color, color: c.color }
                : {}
            }
          >
            <CoinIcon symbol={c.symbol} size={18} />
            {c.symbol}
          </button>
        ))}
      </motion.div>

      {/* Main Chart */}
      {coin && (
        <motion.div
          key={selectedSymbol}
          initial={{ opacity: 0, scale: 0.98 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.3 }}
        >
          <div className="glass-card p-4 lg:p-6">
            {/* Chart Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-5">
              <div className="flex items-center gap-3">
                <div
                  className="w-12 h-12 rounded-full flex items-center justify-center coin-3d glass-card overflow-hidden"
                  style={{ boxShadow: `0 0 20px ${coin.color}40` }}
                >
                  <CoinIcon symbol={coin.symbol} size={40} />
                </div>
                <div>
                  <div
                    className="font-display font-bold text-xl"
                    style={{ color: coin.color }}
                  >
                    {coin.symbol}
                  </div>
                  <div className="text-sm text-muted-foreground">
                    {coin.name}
                  </div>
                </div>
              </div>
              <div className="text-right">
                <div className="font-display font-bold text-2xl neon-cyan">
                  {new Intl.NumberFormat("en-US", {
                    style: "currency",
                    currency: "USD",
                    maximumFractionDigits: coin.price >= 1 ? 2 : 4,
                  }).format(currentPrice)}
                </div>
                <div
                  className={cn(
                    "text-sm font-mono font-bold",
                    up ? "price-up" : "price-down",
                  )}
                >
                  {up ? "▲" : "▼"} {Math.abs(coin.changePercent24h).toFixed(2)}%
                </div>
              </div>
            </div>

            {/* Stats Row */}
            <div className="grid grid-cols-3 gap-3 mb-5">
              <div className="glass-card p-3 text-center">
                <div className="text-xs text-muted-foreground mb-1">High</div>
                <div className="font-mono font-bold text-sm neon-green">
                  {formatUSD(maxPrice)}
                </div>
              </div>
              <div className="glass-card p-3 text-center">
                <div className="text-xs text-muted-foreground mb-1">
                  Current
                </div>
                <div className="font-mono font-bold text-sm neon-cyan">
                  {formatUSD(currentPrice)}
                </div>
              </div>
              <div className="glass-card p-3 text-center">
                <div className="text-xs text-muted-foreground mb-1">Low</div>
                <div className="font-mono font-bold text-sm neon-pink">
                  {formatUSD(minPrice)}
                </div>
              </div>
            </div>

            {/* Chart Type Selector */}
            <div className="flex flex-wrap gap-2 mb-5">
              {CHART_TYPES.map((ct) => (
                <button
                  type="button"
                  key={ct.id}
                  onClick={() => setChartType(ct.id)}
                  className={cn(
                    "px-4 py-1.5 rounded-lg text-xs font-mono font-bold transition-all",
                    chartType === ct.id
                      ? "glass-card text-primary neon-border-cyan"
                      : "glass-card text-muted-foreground hover:text-foreground",
                  )}
                >
                  {ct.label}
                </button>
              ))}
            </div>

            {/* Chart */}
            <div className="h-64 lg:h-80">
              <ResponsiveContainer width="100%" height="100%">
                {/* LINE */}
                {chartType === "line" ? (
                  <LineChart
                    data={lineData}
                    margin={{ top: 5, right: 10, left: 5, bottom: 5 }}
                  >
                    <defs>
                      <linearGradient
                        id={`grad-${selectedSymbol}`}
                        x1="0"
                        y1="0"
                        x2="0"
                        y2="1"
                      >
                        <stop
                          offset="5%"
                          stopColor={coin.color}
                          stopOpacity={0.3}
                        />
                        <stop
                          offset="95%"
                          stopColor={coin.color}
                          stopOpacity={0}
                        />
                      </linearGradient>
                    </defs>
                    <CartesianGrid
                      strokeDasharray="3 3"
                      stroke={GRID_STROKE}
                      vertical={false}
                    />
                    <XAxis
                      dataKey="tick"
                      tick={AXIS_STYLE}
                      axisLine={{ stroke: GRID_STROKE }}
                      tickLine={false}
                      interval={9}
                    />
                    <YAxis
                      domain={["auto", "auto"]}
                      tick={AXIS_STYLE}
                      axisLine={{ stroke: GRID_STROKE }}
                      tickLine={false}
                      tickFormatter={formatUSD}
                      width={70}
                    />
                    <Tooltip content={<PriceTooltip color={coin.color} />} />
                    <ReferenceLine
                      y={currentPrice}
                      stroke={coin.color}
                      strokeDasharray="4 4"
                      strokeOpacity={0.5}
                    />
                    <Line
                      type="monotone"
                      dataKey="price"
                      stroke={coin.color}
                      strokeWidth={2.5}
                      dot={false}
                      activeDot={{ r: 4, fill: coin.color, strokeWidth: 0 }}
                    />
                  </LineChart>
                ) : chartType === "area" ? (
                  /* AREA */
                  <AreaChart
                    data={lineData}
                    margin={{ top: 5, right: 10, left: 5, bottom: 5 }}
                  >
                    <defs>
                      <linearGradient
                        id={`area-${selectedSymbol}`}
                        x1="0"
                        y1="0"
                        x2="0"
                        y2="1"
                      >
                        <stop
                          offset="5%"
                          stopColor={coin.color}
                          stopOpacity={0.4}
                        />
                        <stop
                          offset="95%"
                          stopColor={coin.color}
                          stopOpacity={0.02}
                        />
                      </linearGradient>
                    </defs>
                    <CartesianGrid
                      strokeDasharray="3 3"
                      stroke={GRID_STROKE}
                      vertical={false}
                    />
                    <XAxis
                      dataKey="tick"
                      tick={AXIS_STYLE}
                      axisLine={{ stroke: GRID_STROKE }}
                      tickLine={false}
                      interval={9}
                    />
                    <YAxis
                      domain={["auto", "auto"]}
                      tick={AXIS_STYLE}
                      axisLine={{ stroke: GRID_STROKE }}
                      tickLine={false}
                      tickFormatter={formatUSD}
                      width={70}
                    />
                    <Tooltip content={<PriceTooltip color={coin.color} />} />
                    <ReferenceLine
                      y={currentPrice}
                      stroke={coin.color}
                      strokeDasharray="4 4"
                      strokeOpacity={0.4}
                    />
                    <Area
                      type="monotone"
                      dataKey="price"
                      stroke={coin.color}
                      strokeWidth={2}
                      fill={`url(#area-${selectedSymbol})`}
                      dot={false}
                      activeDot={{ r: 4, fill: coin.color, strokeWidth: 0 }}
                    />
                  </AreaChart>
                ) : chartType === "volume" ? (
                  /* VOLUME */
                  <BarChart
                    data={volumeData}
                    margin={{ top: 5, right: 10, left: 5, bottom: 5 }}
                  >
                    <CartesianGrid
                      strokeDasharray="3 3"
                      stroke={GRID_STROKE}
                      vertical={false}
                    />
                    <XAxis
                      dataKey="tick"
                      tick={AXIS_STYLE}
                      axisLine={{ stroke: GRID_STROKE }}
                      tickLine={false}
                      interval={9}
                    />
                    <YAxis
                      tick={AXIS_STYLE}
                      axisLine={{ stroke: GRID_STROKE }}
                      tickLine={false}
                      tickFormatter={(v: number) => `${(v / 1000).toFixed(0)}K`}
                      width={60}
                    />
                    <Tooltip content={<VolumeTooltip />} />
                    <Bar dataKey="volume" radius={[2, 2, 0, 0]}>
                      {volumeData.map((entry) => (
                        <Cell
                          key={`cell-${entry.tick}`}
                          fill={
                            entry.up
                              ? "oklch(0.82 0.2 150 / 0.8)"
                              : "oklch(0.72 0.22 330 / 0.8)"
                          }
                        />
                      ))}
                    </Bar>
                  </BarChart>
                ) : chartType === "candle" ? (
                  /* CANDLESTICK */
                  <ComposedChart
                    data={candleData}
                    margin={{ top: 5, right: 10, left: 5, bottom: 5 }}
                  >
                    <CartesianGrid
                      strokeDasharray="3 3"
                      stroke={GRID_STROKE}
                      vertical={false}
                    />
                    <XAxis
                      dataKey="tick"
                      tick={AXIS_STYLE}
                      axisLine={{ stroke: GRID_STROKE }}
                      tickLine={false}
                    />
                    <YAxis
                      domain={["auto", "auto"]}
                      tick={AXIS_STYLE}
                      axisLine={{ stroke: GRID_STROKE }}
                      tickLine={false}
                      tickFormatter={formatUSD}
                      width={70}
                    />
                    <Tooltip content={<CandleTooltip />} />
                    <Bar
                      dataKey="body"
                      shape={(props: CandleShapeProps) => (
                        <CandleShape {...props} />
                      )}
                    >
                      {candleData.map((entry) => (
                        <Cell
                          key={`candle-${entry.tick}`}
                          fill={
                            entry.up
                              ? "oklch(0.82 0.2 150)"
                              : "oklch(0.72 0.22 330)"
                          }
                        />
                      ))}
                    </Bar>
                  </ComposedChart>
                ) : (
                  /* RSI */
                  <LineChart
                    data={rsiData}
                    margin={{ top: 5, right: 10, left: 5, bottom: 5 }}
                  >
                    <CartesianGrid
                      strokeDasharray="3 3"
                      stroke={GRID_STROKE}
                      vertical={false}
                    />
                    <XAxis
                      dataKey="tick"
                      tick={AXIS_STYLE}
                      axisLine={{ stroke: GRID_STROKE }}
                      tickLine={false}
                      interval={9}
                    />
                    <YAxis
                      domain={[0, 100]}
                      tick={AXIS_STYLE}
                      axisLine={{ stroke: GRID_STROKE }}
                      tickLine={false}
                      width={40}
                    />
                    <Tooltip content={<RSITooltip />} />
                    <ReferenceLine
                      y={70}
                      stroke="oklch(0.72 0.22 330)"
                      strokeDasharray="4 4"
                      label={{
                        value: "Overbought 70",
                        position: "right",
                        fill: "oklch(0.72 0.22 330)",
                        fontSize: 9,
                        fontFamily: "JetBrains Mono",
                      }}
                    />
                    <ReferenceLine
                      y={30}
                      stroke="oklch(0.82 0.2 150)"
                      strokeDasharray="4 4"
                      label={{
                        value: "Oversold 30",
                        position: "right",
                        fill: "oklch(0.82 0.2 150)",
                        fontSize: 9,
                        fontFamily: "JetBrains Mono",
                      }}
                    />
                    <Line
                      type="monotone"
                      dataKey="rsi"
                      stroke="oklch(0.85 0.18 195)"
                      strokeWidth={2}
                      dot={false}
                      activeDot={{
                        r: 4,
                        fill: "oklch(0.85 0.18 195)",
                        strokeWidth: 0,
                      }}
                    />
                  </LineChart>
                )}
              </ResponsiveContainer>
            </div>

            {/* RSI legend */}
            {chartType === "rsi" && (
              <div className="flex items-center gap-4 mt-3 text-xs font-mono">
                <span className="flex items-center gap-1.5">
                  <span className="w-3 h-0.5 bg-[oklch(0.72_0.22_330)] inline-block" />
                  <span className="text-muted-foreground">
                    Overbought (&gt;70)
                  </span>
                </span>
                <span className="flex items-center gap-1.5">
                  <span className="w-3 h-0.5 bg-[oklch(0.85_0.18_195)] inline-block" />
                  <span className="text-muted-foreground">RSI</span>
                </span>
                <span className="flex items-center gap-1.5">
                  <span className="w-3 h-0.5 bg-[oklch(0.82_0.2_150)] inline-block" />
                  <span className="text-muted-foreground">
                    Oversold (&lt;30)
                  </span>
                </span>
              </div>
            )}
          </div>
        </motion.div>
      )}

      {/* All Coins Mini Charts */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0, transition: { delay: 0.3 } }}
      >
        <h2 className="font-display font-bold text-base neon-purple mb-3">
          All Markets
        </h2>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
          {priceList.map((c) => {
            const miniData = c.history.map((price, i) => ({ tick: i, price }));
            const isUp = c.changePercent24h >= 0;
            return (
              <button
                type="button"
                key={c.symbol}
                onClick={() => setSelectedSymbol(c.symbol)}
                className={cn(
                  "glass-card p-3 text-left transition-all hover:border-primary/30",
                  selectedSymbol === c.symbol && "neon-border-cyan",
                )}
              >
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-1.5">
                    <CoinIcon symbol={c.symbol} size={18} />
                    <span className="font-mono font-bold text-xs">
                      {c.symbol}
                    </span>
                  </div>
                  <span
                    className={cn(
                      "text-xs font-mono",
                      isUp ? "price-up" : "price-down",
                    )}
                  >
                    {isUp ? "+" : ""}
                    {c.changePercent24h.toFixed(1)}%
                  </span>
                </div>
                <div className="h-10">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={miniData}>
                      <Line
                        type="monotone"
                        dataKey="price"
                        stroke={c.color}
                        strokeWidth={1.5}
                        dot={false}
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
                <div className="font-mono text-xs font-bold mt-1.5 text-foreground">
                  {c.price >= 1
                    ? `$${c.price.toFixed(2)}`
                    : `$${c.price.toFixed(4)}`}
                </div>
              </button>
            );
          })}
        </div>
      </motion.div>
    </div>
  );
}
