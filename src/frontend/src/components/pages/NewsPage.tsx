import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { Newspaper, TrendingDown, TrendingUp } from "lucide-react";
import { type Variants, motion } from "motion/react";
import { useState } from "react";
import type { Page } from "../../types/navigation";
import TiltCard from "../TiltCard";

interface NewsPageProps {
  prices?: Record<string, unknown>;
  priceList?: unknown[];
  userData?: unknown;
  onNavigate: (page: Page) => void;
}

type Sentiment = "bullish" | "bearish" | "neutral";

interface NewsItem {
  id: number;
  headline: string;
  summary: string;
  coin: string;
  sentiment: Sentiment;
  timeAgo: string;
  source: string;
}

const NEWS_ITEMS: NewsItem[] = [
  {
    id: 1,
    headline: "Bitcoin ETF Inflows Hit Record $2.1B in Single Day",
    summary:
      "Spot Bitcoin ETFs recorded their highest single-day net inflows, driven by institutional demand from pension funds and sovereign wealth managers entering the market.",
    coin: "BTC",
    sentiment: "bullish",
    timeAgo: "12m ago",
    source: "CryptoDesk",
  },
  {
    id: 2,
    headline: "Ethereum Dencun Upgrade Slashes L2 Gas Fees by 90%",
    summary:
      "The landmark Dencun upgrade has dramatically reduced transaction costs on Ethereum Layer 2 networks, with fees dropping below $0.001 for most transactions on Arbitrum and Optimism.",
    coin: "ETH",
    sentiment: "bullish",
    timeAgo: "38m ago",
    source: "ETH Watchers",
  },
  {
    id: 3,
    headline: "Solana Network Experiences Brief Outage, Now Fully Restored",
    summary:
      "The Solana blockchain suffered a 47-minute outage due to a consensus bug, causing validator nodes to desynchronize. The network has been fully restored with a patch deployed.",
    coin: "SOL",
    sentiment: "bearish",
    timeAgo: "1h ago",
    source: "BlockAlert",
  },
  {
    id: 4,
    headline: "Federal Reserve Signals Potential Rate Cuts in Q3",
    summary:
      "Fed Chair testimony hinted at possible interest rate reductions as inflation approaches the 2% target, historically a bullish signal for risk assets including cryptocurrency.",
    coin: "MARKET",
    sentiment: "bullish",
    timeAgo: "2h ago",
    source: "MacroChain",
  },
  {
    id: 5,
    headline: "Binance Expands to 12 New Markets in Southeast Asia",
    summary:
      "BNB exchange announced regulatory approvals across 12 new jurisdictions in Southeast Asia, positioning BNB for potential demand increases as the exchange's utility token.",
    coin: "BNB",
    sentiment: "bullish",
    timeAgo: "3h ago",
    source: "CryptoNews",
  },
  {
    id: 6,
    headline: "Cardano Voltaire Era Governance Fully Activated On-Chain",
    summary:
      "ADA holders can now vote on protocol changes directly on-chain as Cardano's final Voltaire era roadmap milestone completes, giving full decentralized governance to the community.",
    coin: "ADA",
    sentiment: "bullish",
    timeAgo: "4h ago",
    source: "AdaInsider",
  },
  {
    id: 7,
    headline: "Major Exchange Freezes $350M in User Assets After Hack",
    summary:
      "A tier-2 cryptocurrency exchange halted all withdrawals after detecting unauthorized access to hot wallets. Security researchers linked the breach to a compromised admin key.",
    coin: "MARKET",
    sentiment: "bearish",
    timeAgo: "5h ago",
    source: "SecurityChain",
  },
  {
    id: 8,
    headline: "Dogecoin Sees 15% Spike Following Viral Social Media Campaign",
    summary:
      "A coordinated social media push on several platforms sent DOGE surging briefly. Analysts warn of elevated volatility as momentum trading dominates the low-liquidity memecoin.",
    coin: "DOGE",
    sentiment: "neutral",
    timeAgo: "6h ago",
    source: "MemeMarket",
  },
  {
    id: 9,
    headline:
      "XRP Wins Partial Victory in SEC Lawsuit, Ruling Deemed 'Not a Security'",
    summary:
      "A U.S. court ruled that programmatic sales of XRP on exchanges do not constitute securities transactions, a significant partial win for Ripple in the landmark legal battle.",
    coin: "XRP",
    sentiment: "bullish",
    timeAgo: "8h ago",
    source: "LegalChain",
  },
  {
    id: 10,
    headline:
      "Polygon 2.0 zkEVM Mainnet Processes 10M Transactions in First Week",
    summary:
      "The upgraded Polygon 2.0 zero-knowledge Ethereum Virtual Machine hit a milestone, demonstrating high throughput and sub-cent transaction fees that could attract more DeFi protocols.",
    coin: "MATIC",
    sentiment: "bullish",
    timeAgo: "10h ago",
    source: "ZkWatch",
  },
  {
    id: 11,
    headline: "Global Crypto Market Cap Crosses $3 Trillion Milestone",
    summary:
      "Total cryptocurrency market capitalization surpassed $3 trillion for the first time, with Bitcoin dominance at 52% and altcoins experiencing broad gains across the board.",
    coin: "MARKET",
    sentiment: "bullish",
    timeAgo: "12h ago",
    source: "MarketCap Daily",
  },
  {
    id: 12,
    headline:
      "China Reaffirms Crypto Trading Ban, Warns of Enforcement Crackdown",
    summary:
      "Chinese financial regulators reiterated their prohibition on cryptocurrency trading, signaling enhanced monitoring of VPN-based trading activity and over-the-counter desks.",
    coin: "MARKET",
    sentiment: "bearish",
    timeAgo: "1d ago",
    source: "RegWatch Asia",
  },
  {
    id: 13,
    headline:
      "Bitcoin Halving 132 Days Away — Historical Analysis Points to Rally",
    summary:
      "With the next Bitcoin halving event approaching, analysts point to historical patterns where BTC typically enters a strong bull phase 6-12 months before the supply-reduction event.",
    coin: "BTC",
    sentiment: "bullish",
    timeAgo: "1d ago",
    source: "HalvingWatch",
  },
  {
    id: 14,
    headline: "Solana DeFi TVL Overtakes Ethereum L2s Combined",
    summary:
      "Total Value Locked in Solana DeFi protocols crossed $12B, surpassing the combined TVL of all Ethereum Layer 2 networks and cementing Solana's position as the #2 DeFi chain.",
    coin: "SOL",
    sentiment: "bullish",
    timeAgo: "1d ago",
    source: "DeFiPulse",
  },
  {
    id: 15,
    headline: "Ethereum Co-Founder Sells 10,000 ETH, Stirs Market Discussion",
    summary:
      "On-chain data reveals a wallet linked to an early Ethereum contributor moved 10,000 ETH to a major exchange. While routine for diversification, the move briefly pressured ETH prices.",
    coin: "ETH",
    sentiment: "neutral",
    timeAgo: "2d ago",
    source: "OnChainAlert",
  },
];

const COIN_FILTERS = [
  "ALL",
  "BTC",
  "ETH",
  "SOL",
  "BNB",
  "ADA",
  "DOGE",
  "XRP",
  "MATIC",
  "MARKET",
];

const sentimentConfig = {
  bullish: {
    label: "Bullish",
    color: "oklch(0.82 0.2 150)",
    bg: "oklch(0.82 0.2 150 / 0.12)",
    border: "oklch(0.82 0.2 150 / 0.3)",
    icon: TrendingUp,
  },
  bearish: {
    label: "Bearish",
    color: "oklch(0.72 0.22 330)",
    bg: "oklch(0.72 0.22 330 / 0.12)",
    border: "oklch(0.72 0.22 330 / 0.3)",
    icon: TrendingDown,
  },
  neutral: {
    label: "Neutral",
    color: "oklch(0.55 0.05 230)",
    bg: "oklch(0.55 0.05 230 / 0.12)",
    border: "oklch(0.55 0.05 230 / 0.3)",
    icon: TrendingUp,
  },
};

const container: Variants = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { staggerChildren: 0.06 } },
};

const card: Variants = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0, transition: { duration: 0.4, ease: "easeOut" } },
};

export default function NewsPage(_props: NewsPageProps) {
  const [activeFilter, setActiveFilter] = useState("ALL");
  const [activeSentiment, setActiveSentiment] = useState<Sentiment | "ALL">(
    "ALL",
  );

  const filtered = NEWS_ITEMS.filter((n) => {
    const coinMatch = activeFilter === "ALL" || n.coin === activeFilter;
    const sentimentMatch =
      activeSentiment === "ALL" || n.sentiment === activeSentiment;
    return coinMatch && sentimentMatch;
  });

  const bullCount = NEWS_ITEMS.filter((n) => n.sentiment === "bullish").length;
  const bearCount = NEWS_ITEMS.filter((n) => n.sentiment === "bearish").length;

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
      >
        <div className="flex items-center justify-between gap-4 flex-wrap">
          <div className="flex items-center gap-3">
            <div
              className="w-10 h-10 rounded-xl flex items-center justify-center glass-liquid"
              style={{ boxShadow: "0 0 20px oklch(0.65 0.25 285 / 0.3)" }}
            >
              <Newspaper
                className="w-5 h-5"
                style={{ color: "oklch(0.65 0.25 285)" }}
              />
            </div>
            <div>
              <h1 className="font-display text-2xl lg:text-3xl font-bold gradient-text-holo">
                Market News
              </h1>
              <p className="text-muted-foreground text-sm mt-0.5">
                Simulated crypto market intelligence
              </p>
            </div>
          </div>

          {/* Sentiment summary */}
          <div className="flex gap-3">
            <div className="glass-liquid px-3 py-2 flex items-center gap-2">
              <TrendingUp
                className="w-4 h-4"
                style={{ color: "oklch(0.82 0.2 150)" }}
              />
              <span className="font-mono font-bold text-sm neon-green">
                {bullCount}
              </span>
              <span className="text-xs text-muted-foreground">Bullish</span>
            </div>
            <div className="glass-liquid px-3 py-2 flex items-center gap-2">
              <TrendingDown
                className="w-4 h-4"
                style={{ color: "oklch(0.72 0.22 330)" }}
              />
              <span className="font-mono font-bold text-sm neon-pink">
                {bearCount}
              </span>
              <span className="text-xs text-muted-foreground">Bearish</span>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Filters */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.1 }}
        className="space-y-3"
      >
        {/* Coin filters */}
        <div className="flex flex-wrap gap-2">
          {COIN_FILTERS.map((coin) => (
            <button
              type="button"
              key={coin}
              onClick={() => setActiveFilter(coin)}
              className={cn(
                "text-xs font-mono font-semibold px-3 py-1.5 rounded-full transition-all",
                activeFilter === coin
                  ? "text-background"
                  : "glass-card text-muted-foreground hover:text-foreground",
              )}
              style={
                activeFilter === coin
                  ? {
                      background: "oklch(0.85 0.18 195)",
                      boxShadow: "0 0 12px oklch(0.85 0.18 195 / 0.4)",
                    }
                  : undefined
              }
            >
              {coin}
            </button>
          ))}
        </div>

        {/* Sentiment filters */}
        <div className="flex gap-2">
          {(["ALL", "bullish", "bearish", "neutral"] as const).map((s) => {
            const cfg = s !== "ALL" ? sentimentConfig[s] : null;
            return (
              <button
                type="button"
                key={s}
                onClick={() => setActiveSentiment(s)}
                className={cn(
                  "text-[11px] font-mono font-semibold px-3 py-1 rounded-full transition-all glass-card",
                  activeSentiment === s
                    ? "text-foreground"
                    : "text-muted-foreground hover:text-foreground",
                )}
                style={
                  activeSentiment === s && cfg
                    ? {
                        background: cfg.bg,
                        border: `1px solid ${cfg.border}`,
                        color: cfg.color,
                      }
                    : activeSentiment === s
                      ? {
                          background: "oklch(0.85 0.18 195 / 0.15)",
                          borderColor: "oklch(0.85 0.18 195 / 0.4)",
                        }
                      : undefined
                }
              >
                {s === "ALL" ? "All" : cfg?.label}
              </button>
            );
          })}
        </div>
      </motion.div>

      {/* News Grid */}
      <motion.div
        variants={container}
        initial="hidden"
        animate="show"
        className="grid sm:grid-cols-2 gap-4"
      >
        {filtered.map((news) => {
          const cfg = sentimentConfig[news.sentiment];
          const SentIcon = cfg.icon;

          return (
            <motion.div key={news.id} variants={card}>
              <TiltCard maxTilt={5}>
                <div className="glass-liquid glass-refract p-5 h-full space-y-3 hover:border-primary/30 transition-all cursor-default">
                  {/* Meta row */}
                  <div className="flex items-center justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <span
                        className="text-[10px] font-mono font-bold px-2 py-0.5 rounded-full"
                        style={{
                          color: "oklch(0.85 0.18 195)",
                          background: "oklch(0.85 0.18 195 / 0.12)",
                          border: "1px solid oklch(0.85 0.18 195 / 0.3)",
                        }}
                      >
                        {news.coin}
                      </span>
                      <Badge
                        className="text-[10px] font-mono border-0"
                        style={{
                          background: cfg.bg,
                          color: cfg.color,
                          border: `1px solid ${cfg.border}`,
                        }}
                      >
                        <SentIcon className="w-2.5 h-2.5 mr-1" />
                        {cfg.label}
                      </Badge>
                    </div>
                    <span className="text-[10px] text-muted-foreground font-mono flex-shrink-0">
                      {news.timeAgo}
                    </span>
                  </div>

                  {/* Headline */}
                  <h3 className="font-display font-bold text-sm text-foreground leading-snug">
                    {news.headline}
                  </h3>

                  {/* Summary */}
                  <p className="text-xs text-muted-foreground leading-relaxed line-clamp-3">
                    {news.summary}
                  </p>

                  {/* Source */}
                  <div className="text-[10px] text-muted-foreground font-mono">
                    {news.source}
                  </div>
                </div>
              </TiltCard>
            </motion.div>
          );
        })}
      </motion.div>

      {filtered.length === 0 && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="glass-liquid p-10 text-center space-y-2"
        >
          <Newspaper className="w-10 h-10 mx-auto opacity-20" />
          <p className="text-muted-foreground text-sm">
            No news matching your filters.
          </p>
          <button
            type="button"
            onClick={() => {
              setActiveFilter("ALL");
              setActiveSentiment("ALL");
            }}
            className="text-primary text-sm hover:underline"
          >
            Clear filters →
          </button>
        </motion.div>
      )}
    </div>
  );
}
