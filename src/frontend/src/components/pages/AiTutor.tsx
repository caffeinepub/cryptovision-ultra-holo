import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import {
  CheckCircle2,
  ChevronRight,
  Cpu,
  GraduationCap,
  Sparkles,
  Wifi,
  WifiOff,
  X,
  Zap,
} from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { useEffect, useRef, useState } from "react";
import { toast } from "sonner";
import type { TutorLesson } from "../../backend.d";
import { useTutorLessons } from "../../hooks/useQueries";
import type { Page, PageProps } from "../../types/navigation";
import TiltCard from "../TiltCard";

// Offline cache key
const NOVA_CACHE_KEY = "nova_lessons_cache";

// Fallback lessons shown when backend isn't connected yet
const FALLBACK_LESSONS: TutorLesson[] = [
  {
    id: "1",
    category: "Crypto Basics",
    question: "What is Bitcoin and why does it have value?",
    answer:
      "Bitcoin is a decentralized digital currency that runs on a blockchain — a distributed ledger that records every transaction. It has value because it is scarce (only 21 million will ever exist), it is accepted by millions of people worldwide, and it cannot be counterfeited or censored. Like gold, scarcity and trust drive its value.",
    tips: [
      "Bitcoin was created in 2009 by Satoshi Nakamoto",
      "Its supply is capped at 21 million coins — no central bank can print more",
      "Transactions are verified by miners who solve complex puzzles",
      "Halving events reduce new supply every 4 years, often driving prices up",
    ],
  },
  {
    id: "2",
    category: "Trading",
    question: "What is the difference between market and limit orders?",
    answer:
      "A market order buys or sells immediately at the current best available price. A limit order lets you set a specific price — the trade only happens if the market reaches that price. Market orders guarantee execution but not price; limit orders guarantee price but not execution.",
    tips: [
      "Use market orders when speed matters more than price precision",
      "Use limit orders to buy dips or sell at your target price",
      "Limit orders help you avoid emotional decisions during volatile markets",
      "Always check the spread before placing a market order on low-liquidity coins",
    ],
  },
  {
    id: "3",
    category: "Charts",
    question: "How do you read a candlestick chart?",
    answer:
      "Each candle shows open, high, low, and close price for a time period. The body (thick part) spans from open to close. The wicks (thin lines) show the high and low. A green candle means price closed higher than it opened (bullish). A red candle means price closed lower (bearish).",
    tips: [
      "Long wicks signal rejection — buyers or sellers tried but failed to hold a level",
      "A doji (tiny body) signals indecision between buyers and sellers",
      "Multiple green candles in a row suggest strong momentum",
      "High volume on a breakout candle confirms the move is real",
    ],
  },
  {
    id: "4",
    category: "Risk Management",
    question: "What is the 1% rule in trading?",
    answer:
      "The 1% rule means never risking more than 1% of your total portfolio on a single trade. If you have $10,000, your maximum loss per trade should be $100. This protects you from catastrophic losses even through a long losing streak. Professional traders survive by protecting their capital first.",
    tips: [
      "Even with a 50% win rate, the 1% rule keeps you profitable long-term",
      "Use stop-losses to automatically enforce your risk limit",
      "Never average down into a losing position without a plan",
      "Risk management is more important than finding the perfect entry",
    ],
  },
  {
    id: "5",
    category: "DeFi",
    question: "What is DeFi (Decentralized Finance)?",
    answer:
      "DeFi refers to financial services built on blockchains that operate without banks or middlemen. You can lend, borrow, earn interest, and trade directly using smart contracts — self-executing code that enforces agreements automatically. Anyone with a crypto wallet can access DeFi, 24/7, anywhere in the world.",
    tips: [
      "Uniswap, Aave, and Compound are major DeFi protocols with billions in assets",
      "Smart contracts are transparent — anyone can audit the code",
      "Yield farming lets you earn rewards by providing liquidity to protocols",
      "Always research smart contract audits before investing in DeFi protocols",
    ],
  },
  {
    id: "6",
    category: "Crypto Basics",
    question: "What is a blockchain and how does it work?",
    answer:
      "A blockchain is a chain of data blocks, each containing transactions, cryptographically linked to the previous block. Once data is added, it cannot be altered without redoing all subsequent blocks — making it virtually tamper-proof. The chain is stored on thousands of computers worldwide with no single point of control.",
    tips: [
      "Each block contains a hash of the previous block — breaking the chain is computationally impossible",
      "Public blockchains are fully transparent — anyone can see all transactions",
      "Consensus mechanisms (Proof of Work, Proof of Stake) keep all nodes in agreement",
      "The Internet Computer (ICP) can host entire web apps on-chain",
    ],
  },
  {
    id: "7",
    category: "Trading",
    question: "What is dollar-cost averaging (DCA)?",
    answer:
      "DCA means investing a fixed amount of money at regular intervals (e.g., $100 every week) regardless of price. When prices are low, you buy more. When prices are high, you buy less. Over time, this smooths out your average purchase price and removes the pressure of trying to time the market perfectly.",
    tips: [
      "DCA removes emotion from investing — you invest mechanically, not reactively",
      "It works especially well for long-term holding strategies",
      "Automating your DCA is the most consistent way to implement it",
      "Even professional investors use DCA because market timing is extremely difficult",
    ],
  },
  {
    id: "8",
    category: "Charts",
    question: "What is RSI and how is it used?",
    answer:
      "The Relative Strength Index (RSI) is a momentum indicator that measures the speed and magnitude of price changes, ranging from 0 to 100. Above 70 is typically 'overbought' (price may reverse down); below 30 is 'oversold' (price may reverse up). It helps traders identify potential turning points.",
    tips: [
      "RSI above 70 warns of potential pullback — not a guaranteed sell signal",
      "RSI divergence (price makes new high but RSI doesn't) can signal trend weakness",
      "In strong bull trends, RSI can stay above 70 for extended periods",
      "Always confirm RSI signals with price action and volume",
    ],
  },
  {
    id: "9",
    category: "Risk Management",
    question: "What is a stop-loss and why is it essential?",
    answer:
      "A stop-loss is a pre-set price level where you automatically sell a position to prevent further losses. For example, if you buy BTC at $50,000, you might set a stop-loss at $47,500 (5% loss). Without stop-losses, a bad trade can wipe out gains from many winning trades.",
    tips: [
      "Place stop-losses below significant support levels, not arbitrary percentages",
      "Trailing stop-losses automatically move up as price rises, locking in profits",
      "Never move a stop-loss further away from entry to avoid being stopped out",
      "Stop-losses are especially critical in the volatile crypto market",
    ],
  },
  {
    id: "10",
    category: "DeFi",
    question: "What is yield farming and how does it work?",
    answer:
      "Yield farming means providing your crypto assets to DeFi protocols in exchange for rewards. You might deposit tokens into a liquidity pool and earn fees from traders using that pool, plus bonus tokens. The APY (Annual Percentage Yield) can be very high but comes with risks like impermanent loss and smart contract bugs.",
    tips: [
      "Impermanent loss occurs when the ratio of tokens in your liquidity pool changes",
      "Higher APY usually means higher risk — research before depositing",
      "Gas fees on Ethereum can eat into small yield farming profits",
      "Diversifying across multiple protocols reduces single-protocol risk",
    ],
  },
];

const CATEGORIES = [
  "All",
  "Crypto Basics",
  "Trading",
  "Charts",
  "Risk Management",
  "DeFi",
];

const CATEGORY_COLORS: Record<string, string> = {
  "Crypto Basics": "oklch(0.85 0.18 195)",
  Trading: "oklch(0.82 0.2 150)",
  Charts: "oklch(0.65 0.25 285)",
  "Risk Management": "oklch(0.78 0.2 55)",
  DeFi: "oklch(0.72 0.22 330)",
};

// Cache helpers
function saveLessonsToCache(lessons: TutorLesson[]) {
  try {
    localStorage.setItem(NOVA_CACHE_KEY, JSON.stringify(lessons));
  } catch {
    // ignore
  }
}

function loadLessonsFromCache(): TutorLesson[] | null {
  try {
    const raw = localStorage.getItem(NOVA_CACHE_KEY);
    if (!raw) return null;
    return JSON.parse(raw) as TutorLesson[];
  } catch {
    return null;
  }
}

function NovaRobotDisplay({ typing }: { typing: boolean }) {
  return (
    <div className="relative flex items-center justify-center">
      {/* Outer pulse rings */}
      <motion.div
        className="absolute rounded-full"
        style={{
          width: 220,
          height: 220,
          background: "transparent",
          border: "1px solid oklch(0.85 0.18 195 / 0.2)",
        }}
        animate={{ scale: [1, 1.08, 1], opacity: [0.2, 0.5, 0.2] }}
        transition={{
          duration: 3,
          repeat: Number.POSITIVE_INFINITY,
          ease: "easeInOut",
        }}
      />
      <motion.div
        className="absolute rounded-full"
        style={{
          width: 180,
          height: 180,
          background: "transparent",
          border: "1px solid oklch(0.85 0.18 195 / 0.15)",
        }}
        animate={{ scale: [1, 1.1, 1], opacity: [0.15, 0.4, 0.15] }}
        transition={{
          duration: 3,
          repeat: Number.POSITIVE_INFINITY,
          ease: "easeInOut",
          delay: 0.5,
        }}
      />

      {/* NOVA Robot Image */}
      <motion.div
        className="relative z-10"
        animate={
          typing
            ? {
                filter: [
                  "drop-shadow(0 0 15px oklch(0.85 0.18 195 / 0.5))",
                  "drop-shadow(0 0 30px oklch(0.85 0.18 195 / 0.8))",
                  "drop-shadow(0 0 15px oklch(0.85 0.18 195 / 0.5))",
                ],
              }
            : {
                filter: "drop-shadow(0 0 20px oklch(0.85 0.18 195 / 0.5))",
              }
        }
        transition={{
          duration: 0.8,
          repeat: typing ? Number.POSITIVE_INFINITY : 0,
        }}
      >
        <img
          src="/assets/generated/nova-robot.dim_400x500.png"
          alt="NOVA AI Robot"
          className="w-48 h-48 object-contain object-top"
          style={{
            borderRadius: "50%",
            background: "oklch(0.1 0.03 265 / 0.5)",
          }}
        />
        {/* Typing indicator */}
        <AnimatePresence>
          {typing && (
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.8 }}
              className="absolute -bottom-1 -right-1 flex gap-0.5 glass-card px-2 py-1 rounded-full"
              style={{ border: "1px solid oklch(0.85 0.18 195 / 0.4)" }}
            >
              {([0, 0.15, 0.3] as const).map((delay) => (
                <motion.div
                  key={`dot-${delay}`}
                  className="w-1.5 h-1.5 rounded-full"
                  style={{ background: "oklch(0.85 0.18 195)" }}
                  animate={{ opacity: [0.3, 1, 0.3], scale: [0.8, 1, 0.8] }}
                  transition={{
                    duration: 0.7,
                    repeat: Number.POSITIVE_INFINITY,
                    delay,
                    ease: "easeInOut",
                  }}
                />
              ))}
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>

      {/* Orbiting particles */}
      {([0, 120, 240] as const).map((deg) => (
        <motion.div
          key={`orbit-${deg}`}
          className="absolute w-2 h-2 rounded-full"
          style={{
            background: "oklch(0.85 0.18 195 / 0.6)",
            boxShadow: "0 0 6px oklch(0.85 0.18 195)",
          }}
          animate={{
            x: [
              Math.cos((deg * Math.PI) / 180) * 90,
              Math.cos(((deg + 360) * Math.PI) / 180) * 90,
            ],
            y: [
              Math.sin((deg * Math.PI) / 180) * 90,
              Math.sin(((deg + 360) * Math.PI) / 180) * 90,
            ],
          }}
          transition={{
            duration: 5 + deg / 120,
            repeat: Number.POSITIVE_INFINITY,
            ease: "linear",
          }}
        />
      ))}
    </div>
  );
}

function TypewriterText({
  text,
  onDone,
}: { text: string; onDone?: () => void }) {
  const [displayed, setDisplayed] = useState("");
  const [done, setDone] = useState(false);
  const doneRef = useRef(false);

  useEffect(() => {
    setDisplayed("");
    setDone(false);
    doneRef.current = false;
    let i = 0;
    const interval = setInterval(() => {
      i++;
      setDisplayed(text.slice(0, i));
      if (i >= text.length) {
        clearInterval(interval);
        if (!doneRef.current) {
          doneRef.current = true;
          setDone(true);
          onDone?.();
        }
      }
    }, 18);
    return () => clearInterval(interval);
  }, [text, onDone]);

  return (
    <span>
      {displayed}
      {!done && (
        <motion.span
          animate={{ opacity: [1, 0, 1] }}
          transition={{ duration: 0.6, repeat: Number.POSITIVE_INFINITY }}
          className="inline-block w-0.5 h-4 ml-0.5 align-middle"
          style={{ background: "oklch(0.85 0.18 195)" }}
        />
      )}
    </span>
  );
}

interface LessonCardProps {
  lesson: TutorLesson;
  isActive: boolean;
  isLearned: boolean;
  onClick: () => void;
}

function LessonCard({ lesson, isActive, isLearned, onClick }: LessonCardProps) {
  const color = CATEGORY_COLORS[lesson.category] ?? "oklch(0.85 0.18 195)";
  return (
    <TiltCard maxTilt={4}>
      <motion.button
        type="button"
        onClick={onClick}
        className={cn(
          "w-full text-left glass-liquid glass-refract p-4 transition-all duration-200 group relative",
          isActive ? "neon-border-cyan" : "hover:border-primary/30",
        )}
        whileTap={{ scale: 0.99 }}
        style={
          isActive
            ? { boxShadow: "0 0 20px oklch(0.85 0.18 195 / 0.2)" }
            : undefined
        }
      >
        {isLearned && (
          <div
            className="absolute top-2 right-2 w-5 h-5 rounded-full flex items-center justify-center"
            style={{
              background: "oklch(0.82 0.2 150 / 0.2)",
              border: "1px solid oklch(0.82 0.2 150 / 0.5)",
            }}
          >
            <CheckCircle2
              className="w-3 h-3"
              style={{ color: "oklch(0.82 0.2 150)" }}
            />
          </div>
        )}
        <div className="flex items-start justify-between gap-2 mb-2">
          <span
            className="text-[10px] font-mono font-bold px-2 py-0.5 rounded-full"
            style={{
              color,
              background: color.replace(")", " / 0.12)"),
              border: `1px solid ${color.replace(")", " / 0.3)")}`,
            }}
          >
            {lesson.category}
          </span>
          <ChevronRight
            className={cn(
              "w-4 h-4 mt-0.5 transition-all flex-shrink-0",
              isActive ? "text-primary rotate-90" : "text-muted-foreground",
            )}
          />
        </div>
        <p className="text-sm font-medium text-foreground leading-snug pr-5">
          {lesson.question}
        </p>
      </motion.button>
    </TiltCard>
  );
}

interface AiTutorPageProps extends PageProps {
  onNavigate: (page: Page) => void;
}

export default function AiTutor({ userData }: AiTutorPageProps) {
  const { data: backendLessons = [] } = useTutorLessons();
  const [isOffline, setIsOffline] = useState(false);

  // Save to cache whenever we get live data
  useEffect(() => {
    if (backendLessons.length > 0) {
      saveLessonsToCache(backendLessons);
      setIsOffline(false);
    }
  }, [backendLessons]);

  // Determine which lessons to use: backend > cache > fallback
  const displayLessons = (() => {
    if (backendLessons.length > 0) return backendLessons;
    const cached = loadLessonsFromCache();
    if (cached && cached.length > 0) {
      if (!isOffline) setIsOffline(true);
      return cached;
    }
    setIsOffline(true);
    return FALLBACK_LESSONS;
  })();

  const [activeCategory, setActiveCategory] = useState("All");
  const [selectedLesson, setSelectedLesson] = useState<TutorLesson | null>(
    null,
  );
  const [isTyping, setIsTyping] = useState(false);
  const [showAnswer, setShowAnswer] = useState(false);
  const [xpEarned, setXpEarned] = useState(0);
  const [learnedIds, setLearnedIds] = useState<Set<string>>(new Set());

  const tradeCount = userData?.tradeHistory?.length ?? 0;
  const prevTradeCountRef = useRef(tradeCount);

  useEffect(() => {
    if (tradeCount > prevTradeCountRef.current) {
      prevTradeCountRef.current = tradeCount;
      toast("🤖 Robot Tip", {
        description:
          "Great trade! Remember: never risk more than 1-2% of your portfolio on a single position.",
        duration: 6000,
      });
    }
  }, [tradeCount]);

  const filtered =
    activeCategory === "All"
      ? displayLessons
      : displayLessons.filter((l) => l.category === activeCategory);

  const handleSelectLesson = (lesson: TutorLesson) => {
    if (selectedLesson?.id === lesson.id) return;
    setShowAnswer(false);
    setSelectedLesson(lesson);
    setIsTyping(true);

    setTimeout(() => {
      setIsTyping(false);
      setShowAnswer(true);
    }, 1000);

    if (!learnedIds.has(lesson.id)) {
      setLearnedIds((prev) => new Set([...prev, lesson.id]));
      setXpEarned((prev) => prev + 5);
      setTimeout(() => {
        toast.success("+5 XP", {
          description: `You learned about: ${lesson.question.slice(0, 50)}...`,
          duration: 3000,
        });
      }, 1200);
    }
  };

  const totalLessons = displayLessons.length;
  const learnedCount = learnedIds.size;
  const progressPct =
    totalLessons > 0 ? (learnedCount / totalLessons) * 100 : 0;

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-start justify-between gap-4 flex-wrap"
      >
        <div>
          <div className="flex items-center gap-3">
            <h1 className="font-display text-2xl lg:text-3xl font-bold gradient-text-holo">
              AI Tutor
            </h1>
            {isOffline && (
              <motion.div
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                className="flex items-center gap-1.5 glass-card px-2.5 py-1 rounded-full"
                style={{ border: "1px solid oklch(0.78 0.2 55 / 0.4)" }}
              >
                <WifiOff
                  className="w-3 h-3"
                  style={{ color: "oklch(0.78 0.2 55)" }}
                />
                <span
                  className="text-[10px] font-mono font-bold"
                  style={{ color: "oklch(0.78 0.2 55)" }}
                >
                  OFFLINE MODE
                </span>
              </motion.div>
            )}
            {!isOffline && (
              <div className="flex items-center gap-1.5 text-[10px] font-mono text-muted-foreground">
                <Wifi className="w-3 h-3 text-accent" />
                LIVE
              </div>
            )}
          </div>
          <p className="text-muted-foreground text-sm mt-1">
            Learn crypto with NOVA — your AI robot tutor
          </p>
        </div>
        <div className="flex items-center gap-3">
          <div className="glass-liquid px-4 py-2 flex items-center gap-2">
            <Zap className="w-4 h-4 text-primary" />
            <span className="font-mono font-bold text-sm neon-cyan">
              +{xpEarned} XP
            </span>
            <span className="text-xs text-muted-foreground">this session</span>
          </div>
          <div className="glass-liquid px-4 py-2 flex items-center gap-2">
            <GraduationCap className="w-4 h-4 text-accent" />
            <span className="font-mono text-sm font-bold neon-green">
              {learnedCount}/{totalLessons}
            </span>
            <span className="text-xs text-muted-foreground">learned</span>
          </div>
        </div>
      </motion.div>

      {/* Progress bar */}
      <motion.div
        initial={{ opacity: 0, scaleX: 0 }}
        animate={{ opacity: 1, scaleX: 1 }}
        className="glass-liquid p-3"
        style={{ transformOrigin: "left" }}
      >
        <div className="flex items-center justify-between mb-2">
          <span className="text-xs text-muted-foreground font-mono">
            Learning Progress
          </span>
          <span className="text-xs font-mono neon-cyan">
            {progressPct.toFixed(0)}%
          </span>
        </div>
        <div className="h-2 rounded-full bg-muted/30 overflow-hidden">
          <motion.div
            className="h-full rounded-full"
            style={{
              background:
                "linear-gradient(90deg, oklch(0.85 0.18 195), oklch(0.65 0.25 285))",
              boxShadow: "0 0 8px oklch(0.85 0.18 195 / 0.5)",
            }}
            animate={{ width: `${progressPct}%` }}
            transition={{ duration: 0.5, ease: "easeOut" }}
          />
        </div>
      </motion.div>

      <div className="grid lg:grid-cols-5 gap-6">
        {/* Left column — NOVA robot + answer */}
        <div className="lg:col-span-2 space-y-4">
          {/* NOVA Robot panel */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.1 }}
            className="glass-liquid glass-refract p-6 flex flex-col items-center gap-4"
          >
            <NovaRobotDisplay typing={isTyping} />
            <div className="text-center">
              <div className="font-display font-bold text-sm neon-cyan mb-0.5">
                NOVA — AI Tutor
              </div>
              <div className="text-xs text-muted-foreground font-mono">
                {isTyping
                  ? "Analyzing your question..."
                  : selectedLesson
                    ? "Here's what I know 👇"
                    : "Select a lesson to begin →"}
              </div>
            </div>

            {/* Category chips */}
            <div className="flex flex-wrap justify-center gap-1.5 mt-1">
              {CATEGORIES.map((cat) => (
                <button
                  type="button"
                  key={cat}
                  onClick={() => setActiveCategory(cat)}
                  className={cn(
                    "text-[10px] font-mono font-semibold px-2.5 py-1 rounded-full transition-all",
                    activeCategory === cat
                      ? "text-background font-bold"
                      : "glass-card text-muted-foreground hover:text-foreground",
                  )}
                  style={
                    activeCategory === cat
                      ? {
                          background:
                            cat === "All"
                              ? "oklch(0.85 0.18 195)"
                              : CATEGORY_COLORS[cat],
                          boxShadow:
                            cat === "All"
                              ? "0 0 12px oklch(0.85 0.18 195 / 0.4)"
                              : `0 0 12px ${CATEGORY_COLORS[cat]?.replace(")", " / 0.4)")}`,
                        }
                      : undefined
                  }
                >
                  {cat}
                </button>
              ))}
            </div>
          </motion.div>

          {/* Answer panel */}
          <AnimatePresence mode="wait">
            {selectedLesson && (
              <motion.div
                key={selectedLesson.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="glass-liquid glass-refract p-5 space-y-4"
                style={{ border: "1px solid oklch(0.85 0.18 195 / 0.3)" }}
              >
                {/* Question */}
                <div className="flex items-start gap-2">
                  <div
                    className="w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5"
                    style={{
                      background: "oklch(0.65 0.25 285 / 0.2)",
                      border: "1px solid oklch(0.65 0.25 285 / 0.4)",
                    }}
                  >
                    <Cpu
                      className="w-3.5 h-3.5"
                      style={{ color: "oklch(0.65 0.25 285)" }}
                    />
                  </div>
                  <p className="text-sm font-medium text-foreground">
                    {selectedLesson.question}
                  </p>
                </div>

                {/* Typing / Answer */}
                <div className="flex items-start gap-2">
                  <div
                    className="w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5 flex-none overflow-hidden"
                    style={{
                      border: "1px solid oklch(0.85 0.18 195 / 0.4)",
                    }}
                  >
                    <img
                      src="/assets/generated/nova-robot.dim_400x500.png"
                      alt="NOVA"
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div className="flex-1">
                    <AnimatePresence mode="wait">
                      {isTyping ? (
                        <motion.div
                          key="typing"
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          exit={{ opacity: 0 }}
                          className="flex gap-1.5 items-center py-2"
                        >
                          {([0, 0.15, 0.3] as const).map((d) => (
                            <motion.div
                              key={`typing-dot-${d}`}
                              className="w-2 h-2 rounded-full"
                              style={{ background: "oklch(0.85 0.18 195)" }}
                              animate={{
                                y: [0, -6, 0],
                                opacity: [0.4, 1, 0.4],
                              }}
                              transition={{
                                duration: 0.6,
                                repeat: Number.POSITIVE_INFINITY,
                                delay: d,
                              }}
                            />
                          ))}
                        </motion.div>
                      ) : showAnswer ? (
                        <motion.div
                          key="answer"
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                        >
                          <p className="text-sm text-foreground leading-relaxed">
                            <TypewriterText text={selectedLesson.answer} />
                          </p>
                        </motion.div>
                      ) : null}
                    </AnimatePresence>
                  </div>
                </div>

                {/* Tips */}
                <AnimatePresence>
                  {showAnswer && (
                    <motion.div
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.6 }}
                      className="space-y-2"
                    >
                      <div className="flex items-center gap-1.5 text-xs font-mono font-semibold text-muted-foreground uppercase tracking-wider">
                        <Sparkles className="w-3 h-3 text-primary" />
                        Pro Tips
                      </div>
                      {selectedLesson.tips.map((tip, i) => (
                        <motion.div
                          key={`tip-${tip.slice(0, 20)}`}
                          initial={{ opacity: 0, x: -8 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: 0.7 + i * 0.1 }}
                          className="flex items-start gap-2 text-sm text-muted-foreground"
                        >
                          <CheckCircle2
                            className="w-4 h-4 mt-0.5 flex-shrink-0"
                            style={{ color: "oklch(0.82 0.2 150)" }}
                          />
                          <span>{tip}</span>
                        </motion.div>
                      ))}
                    </motion.div>
                  )}
                </AnimatePresence>

                {/* Close */}
                <button
                  type="button"
                  onClick={() => {
                    setSelectedLesson(null);
                    setShowAnswer(false);
                    setIsTyping(false);
                  }}
                  className="text-xs text-muted-foreground hover:text-foreground flex items-center gap-1 transition-colors"
                >
                  <X className="w-3 h-3" /> Close answer
                </button>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Empty state when no lesson selected */}
          {!selectedLesson && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="glass-liquid glass-refract p-6 text-center space-y-2"
            >
              <p className="text-sm text-muted-foreground">
                🤖 Pick a lesson on the right and I'll explain it step-by-step!
              </p>
              <p className="text-xs text-muted-foreground font-mono">
                Earn +5 XP for each new lesson you learn
              </p>
            </motion.div>
          )}
        </div>

        {/* Right column — lesson cards */}
        <div className="lg:col-span-3 space-y-3">
          <div className="flex items-center justify-between">
            <div className="text-xs text-muted-foreground font-mono uppercase tracking-wider">
              {filtered.length} Lessons
              {activeCategory !== "All" && ` · ${activeCategory}`}
            </div>
            {learnedCount > 0 && (
              <Badge
                variant="outline"
                className="text-xs font-mono"
                style={{
                  borderColor: "oklch(0.82 0.2 150 / 0.4)",
                  color: "oklch(0.82 0.2 150)",
                }}
              >
                {learnedCount} completed
              </Badge>
            )}
          </div>

          <motion.div
            variants={{
              hidden: { opacity: 0 },
              show: { opacity: 1, transition: { staggerChildren: 0.06 } },
            }}
            initial="hidden"
            animate="show"
            className="grid sm:grid-cols-2 gap-3"
          >
            {filtered.map((lesson) => (
              <motion.div
                key={lesson.id}
                variants={{
                  hidden: { opacity: 0, y: 12 },
                  show: { opacity: 1, y: 0, transition: { duration: 0.3 } },
                }}
              >
                <LessonCard
                  lesson={lesson}
                  isActive={selectedLesson?.id === lesson.id}
                  isLearned={learnedIds.has(lesson.id)}
                  onClick={() => handleSelectLesson(lesson)}
                />
              </motion.div>
            ))}
          </motion.div>

          {filtered.length === 0 && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="glass-liquid glass-refract p-10 text-center space-y-3"
            >
              <img
                src="/assets/generated/nova-robot.dim_400x500.png"
                alt="NOVA"
                className="w-16 h-16 object-contain object-top mx-auto opacity-30"
              />
              <p className="text-muted-foreground">
                No lessons in this category yet.
              </p>
              <button
                type="button"
                onClick={() => setActiveCategory("All")}
                className="text-primary text-sm hover:underline"
              >
                Show all lessons →
              </button>
            </motion.div>
          )}
        </div>
      </div>
    </div>
  );
}
