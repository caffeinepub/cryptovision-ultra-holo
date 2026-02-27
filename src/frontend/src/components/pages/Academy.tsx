import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";
import {
  BookOpen,
  ChevronDown,
  ChevronUp,
  GraduationCap,
  Loader2,
} from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { useState } from "react";
import type { EducationArticle } from "../../backend.d";
import type { UserDataView } from "../../backend.d";
import type { CoinPrice } from "../../hooks/usePrices";
import { useAcademyContent } from "../../hooks/useQueries";
import type { Page } from "../../types/navigation";

interface AcademyProps {
  prices: Record<string, CoinPrice>;
  priceList: CoinPrice[];
  userData?: UserDataView;
  onNavigate: (page: Page) => void;
}

const FALLBACK_ARTICLES: EducationArticle[] = [
  {
    title: "What is Blockchain Technology?",
    summary:
      "The foundational technology powering all cryptocurrencies — an immutable distributed ledger.",
    content: `Blockchain is a distributed ledger technology that records transactions across many computers in such a way that the record cannot be altered retroactively. Each block in the chain contains transaction data, a timestamp, and a cryptographic hash of the previous block.

Key properties:
- **Decentralization**: No single entity controls the chain
- **Immutability**: Once recorded, data cannot be changed
- **Transparency**: All transactions are publicly verifiable
- **Security**: Cryptographic hashing prevents tampering

Blockchain enables trustless transactions between parties without requiring a central authority like a bank or government. This is the revolutionary core concept behind Bitcoin and all subsequent cryptocurrencies.`,
  },
  {
    title: "Understanding Bitcoin: Digital Gold",
    summary:
      "Bitcoin is the world's first cryptocurrency and remains the most valuable by market capitalization.",
    content: `Bitcoin (BTC) was created in 2009 by the pseudonymous Satoshi Nakamoto. It operates on a peer-to-peer network where transactions are verified by network nodes through cryptography.

Key concepts:
- **Proof of Work**: Miners solve complex puzzles to validate transactions
- **21 Million Cap**: Only 21 million BTC will ever exist, creating scarcity
- **Halving**: Every 4 years, mining rewards are cut in half, reducing supply
- **Wallets**: Store cryptographic keys, not actual coins

Bitcoin is often called "digital gold" because of its fixed supply and store-of-value properties. Many investors hold BTC as a hedge against inflation and currency devaluation.`,
  },
  {
    title: "Ethereum and Smart Contracts",
    summary:
      "Learn how Ethereum revolutionized crypto with programmable money and decentralized applications.",
    content: `Ethereum (ETH), launched in 2015 by Vitalik Buterin, extended blockchain technology beyond simple transactions to include programmable smart contracts.

Smart contracts are self-executing programs stored on the blockchain that automatically enforce agreement terms:
- **DeFi**: Decentralized Finance protocols for lending, trading
- **NFTs**: Non-fungible tokens for digital ownership
- **DAOs**: Decentralized Autonomous Organizations
- **dApps**: Decentralized applications

Ethereum transitioned to Proof of Stake (PoS) consensus in 2022 ("The Merge"), reducing energy consumption by ~99.95%.`,
  },
  {
    title: "Crypto Trading Strategies",
    summary:
      "Essential trading strategies from HODLing to day trading — find what works for your risk profile.",
    content: `There are several approaches to cryptocurrency trading, each with distinct risk/reward profiles:

**Long-term strategies:**
- **HODL**: Buy and hold through market cycles. Best for believers in long-term value.
- **Dollar Cost Averaging (DCA)**: Invest fixed amounts at regular intervals to smooth entry price.

**Active trading strategies:**
- **Swing Trading**: Hold positions for days to weeks, targeting medium-term trends.
- **Day Trading**: Open and close positions within a single day. High risk, requires experience.
- **Scalping**: Dozens of small trades per day for tiny profits. Very high-frequency.

**Risk management essentials:**
- Never invest more than you can afford to lose
- Diversify across multiple assets
- Set stop-losses to limit downside
- Keep emotions out of trading decisions`,
  },
  {
    title: "DeFi: Decentralized Finance Explained",
    summary:
      "How DeFi is reshaping traditional banking with open, permissionless financial protocols.",
    content: `Decentralized Finance (DeFi) refers to financial services built on blockchain networks that operate without traditional intermediaries like banks or brokers.

Core DeFi primitives:
- **DEXs (Decentralized Exchanges)**: Trade tokens directly from your wallet (Uniswap, dYdX)
- **Lending Protocols**: Earn interest or borrow against crypto collateral (Aave, Compound)
- **Stablecoins**: Crypto pegged to fiat currencies (USDC, DAI)
- **Yield Farming**: Provide liquidity to earn trading fees and token rewards
- **Liquidity Pools**: Smart contract-managed pools that enable automated market making

Total Value Locked (TVL) in DeFi protocols reached over $100B at peak, demonstrating significant adoption of these open financial tools.`,
  },
  {
    title: "Understanding Market Cycles",
    summary:
      "Crypto markets move in cycles — learn to recognize bull runs, bear markets, and accumulation phases.",
    content: `Cryptocurrency markets exhibit recurring cycle patterns, often correlated with Bitcoin's halving events:

**The 4-year cycle:**
- **Accumulation**: Prices are low, smart money accumulates
- **Bull Run**: Rising prices attract retail interest, media coverage
- **Distribution**: Early buyers sell to late entrants
- **Bear Market**: Prices decline 80-90%, weak hands exit

**Market psychology stages:**
- Disbelief → Hope → Optimism → Belief → Thrill → Euphoria (peak)
- Complacency → Anxiety → Denial → Panic → Capitulation → Anger → Depression (bottom)

Understanding where we are in the cycle helps set appropriate expectations and avoid emotional decisions driven by FOMO (fear of missing out) or panic selling.`,
  },
];

const articleColors = [
  "neon-cyan",
  "neon-purple",
  "neon-green",
  "neon-pink",
  "neon-cyan",
  "neon-purple",
];

const articleEmojis = ["⛓️", "₿", "🧠", "📈", "🏦", "🔄"];

const container = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { staggerChildren: 0.08 } },
};

const item = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0, transition: { duration: 0.4 } },
};

export default function Academy(_props: AcademyProps) {
  const { data: articles, isLoading } = useAcademyContent();
  const [expandedIndex, setExpandedIndex] = useState<number | null>(null);
  const [searchTerm, setSearchTerm] = useState("");

  const displayArticles =
    (articles?.length ?? 0) > 0 ? articles! : FALLBACK_ARTICLES;
  const filtered = displayArticles.filter(
    (a) =>
      a.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      a.summary.toLowerCase().includes(searchTerm.toLowerCase()),
  );

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <h1 className="font-display text-2xl lg:text-3xl font-bold gradient-text-holo">
          Crypto Academy
        </h1>
        <p className="text-muted-foreground text-sm mt-1">
          Master the fundamentals of crypto trading
        </p>
      </motion.div>

      {/* Stats */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1, transition: { delay: 0.1 } }}
        className="flex flex-wrap gap-3"
      >
        {[
          {
            label: "Lessons",
            value: displayArticles.length,
            color: "neon-cyan",
          },
          { label: "Topics", value: 6, color: "neon-purple" },
          { label: "Level", value: "Beginner", color: "neon-green" },
        ].map((stat) => (
          <div
            key={stat.label}
            className="glass-card px-4 py-2 flex items-center gap-2"
          >
            <GraduationCap className={cn("w-4 h-4", stat.color)} />
            <span className="text-sm text-muted-foreground">{stat.label}:</span>
            <span className={cn("font-mono font-bold text-sm", stat.color)}>
              {stat.value}
            </span>
          </div>
        ))}
      </motion.div>

      {/* Search */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1, transition: { delay: 0.15 } }}
      >
        <input
          type="text"
          placeholder="Search lessons..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full max-w-md bg-muted/30 border border-primary/20 focus:border-primary/60 rounded-lg px-4 py-2.5 text-sm font-mono text-foreground placeholder:text-muted-foreground outline-none transition-colors focus:ring-1 focus:ring-primary/30"
        />
      </motion.div>

      {/* Articles */}
      {isLoading ? (
        <div className="grid sm:grid-cols-2 gap-4">
          {Array.from({ length: 6 }, (_, i) => `skel-${i}`).map((id) => (
            <Skeleton key={id} className="h-40 rounded-xl bg-muted/30" />
          ))}
        </div>
      ) : (
        <motion.div
          variants={container}
          initial="hidden"
          animate="show"
          className="space-y-3"
        >
          {filtered.map((article, i) => {
            const isExpanded = expandedIndex === i;
            const colorClass = articleColors[i % articleColors.length];
            const emoji = articleEmojis[i % articleEmojis.length];

            return (
              <motion.div key={article.title} variants={item} layout>
                <div
                  className={cn(
                    "glass-card overflow-hidden transition-all duration-300",
                    isExpanded && "neon-border-cyan",
                  )}
                >
                  {/* Header */}
                  <button
                    type="button"
                    onClick={() => setExpandedIndex(isExpanded ? null : i)}
                    className="w-full flex items-start gap-4 p-4 lg:p-5 text-left hover:bg-muted/20 transition-colors"
                  >
                    <div
                      className={cn(
                        "w-10 h-10 rounded-xl flex items-center justify-center text-lg flex-shrink-0 glass-card mt-0.5",
                      )}
                    >
                      {emoji}
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3
                        className={cn(
                          "font-display font-bold text-base mb-1",
                          colorClass,
                        )}
                      >
                        {article.title}
                      </h3>
                      <p className="text-sm text-muted-foreground line-clamp-2">
                        {article.summary}
                      </p>
                    </div>
                    <div className="flex-shrink-0 mt-1">
                      {isExpanded ? (
                        <ChevronUp className="w-5 h-5 text-primary" />
                      ) : (
                        <ChevronDown className="w-5 h-5 text-muted-foreground" />
                      )}
                    </div>
                  </button>

                  {/* Expanded Content */}
                  <AnimatePresence>
                    {isExpanded && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: "auto", opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.3, ease: "easeInOut" }}
                        className="overflow-hidden"
                      >
                        <div className="px-4 lg:px-5 pb-5 pt-0">
                          <div className="h-px bg-border mb-4" />
                          <div className="prose prose-invert prose-sm max-w-none">
                            {article.content.split("\n\n").map((para) => (
                              <p
                                key={para.slice(0, 40)}
                                className="text-sm text-muted-foreground mb-3 leading-relaxed"
                                style={{ whiteSpace: "pre-line" }}
                              >
                                {para}
                              </p>
                            ))}
                          </div>
                          <div className="mt-4 flex items-center gap-2">
                            <BookOpen className="w-4 h-4 text-primary" />
                            <span className="text-xs text-muted-foreground">
                              Estimated read time: ~
                              {Math.ceil(
                                article.content.split(" ").length / 200,
                              )}{" "}
                              min
                            </span>
                          </div>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              </motion.div>
            );
          })}
        </motion.div>
      )}

      {filtered.length === 0 && !isLoading && (
        <div className="text-center py-16 text-muted-foreground">
          <BookOpen className="w-12 h-12 mx-auto mb-3 opacity-30" />
          <p className="text-base font-medium">No lessons found</p>
          <p className="text-sm mt-1">Try a different search term</p>
        </div>
      )}
    </div>
  );
}
