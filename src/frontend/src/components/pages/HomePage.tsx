import { usePWAInstall } from "@/hooks/usePWAInstall";
import { cn } from "@/lib/utils";
import {
  BarChart3,
  Brain,
  Download,
  Rocket,
  Shield,
  TrendingUp,
  Trophy,
  Zap,
} from "lucide-react";
import { AnimatePresence, type Variants, motion } from "motion/react";
import { useEffect, useRef, useState } from "react";
import CoinIcon from "../CoinIcon";

interface HomePageProps {
  onLaunch: () => void;
}

const FEATURES = [
  {
    icon: TrendingUp,
    title: "Virtual Trading",
    desc: "Trade with $10,000 virtual funds. Practice strategies risk-free.",
    color: "oklch(0.85 0.18 195)",
    colorClass: "neon-cyan",
  },
  {
    icon: BarChart3,
    title: "Live Charts",
    desc: "5 chart types: Line, Area, Volume, Candlestick & RSI indicator.",
    color: "oklch(0.65 0.25 285)",
    colorClass: "neon-purple",
  },
  {
    icon: Brain,
    title: "AI Insights",
    desc: "Market signals, trend analysis, and smart trading suggestions.",
    color: "oklch(0.82 0.2 150)",
    colorClass: "neon-green",
  },
  {
    icon: Trophy,
    title: "Gamification",
    desc: "Earn XP, unlock badges, and climb the trader leaderboard.",
    color: "oklch(0.72 0.22 330)",
    colorClass: "neon-pink",
  },
];

const COINS = ["BTC", "ETH", "SOL", "BNB", "ADA", "DOGE", "XRP", "MATIC"];

const FLOATING_COINS = COINS.map((symbol, i) => ({
  symbol,
  x: 5 + (i % 4) * 25 + Math.sin(i * 1.3) * 5,
  y: 10 + Math.floor(i / 4) * 45 + Math.cos(i * 0.9) * 8,
  size: 28 + (i % 3) * 10,
  delay: i * 0.4,
  duration: 3.5 + i * 0.3,
  opacity: 0.15 + (i % 3) * 0.08,
}));

const containerVariants: Variants = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { staggerChildren: 0.12, delayChildren: 0.2 },
  },
};

const itemVariants: Variants = {
  hidden: { opacity: 0, y: 24 },
  show: { opacity: 1, y: 0, transition: { duration: 0.5, ease: "easeOut" } },
};

// Animated particle
function Particle({ x, y, delay }: { x: number; y: number; delay: number }) {
  return (
    <motion.div
      className="absolute rounded-full"
      style={{
        left: `${x}%`,
        top: `${y}%`,
        width: 3,
        height: 3,
        background: "oklch(0.85 0.18 195 / 0.6)",
        boxShadow: "0 0 6px oklch(0.85 0.18 195 / 0.8)",
      }}
      animate={{
        opacity: [0, 1, 0],
        scale: [0.5, 1.5, 0.5],
        y: [0, -20, 0],
      }}
      transition={{
        duration: 3 + Math.random() * 2,
        repeat: Number.POSITIVE_INFINITY,
        delay,
        ease: "easeInOut",
      }}
    />
  );
}

// Laser grid lines
function GridLines() {
  return (
    <svg
      className="absolute inset-0 w-full h-full opacity-10"
      preserveAspectRatio="none"
      aria-hidden="true"
    >
      <defs>
        <pattern id="grid" width="60" height="60" patternUnits="userSpaceOnUse">
          <path
            d="M 60 0 L 0 0 0 60"
            fill="none"
            stroke="oklch(0.85 0.18 195)"
            strokeWidth="0.5"
          />
        </pattern>
      </defs>
      <rect width="100%" height="100%" fill="url(#grid)" />
    </svg>
  );
}

export default function HomePage({ onLaunch }: HomePageProps) {
  const { canInstall, install, installed } = usePWAInstall();

  const [particles] = useState(() =>
    Array.from({ length: 24 }, (_, i) => ({
      id: i,
      x: Math.random() * 100,
      y: Math.random() * 100,
      delay: Math.random() * 4,
    })),
  );

  const [glitching, setGlitching] = useState(false);
  const glitchRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    glitchRef.current = setInterval(() => {
      setGlitching(true);
      setTimeout(() => setGlitching(false), 120);
    }, 5000);
    return () => {
      if (glitchRef.current) clearInterval(glitchRef.current);
    };
  }, []);

  return (
    <div className="relative min-h-screen flex flex-col items-center justify-center overflow-hidden">
      {/* Background grid */}
      <GridLines />

      {/* Ambient glows */}
      <div
        className="absolute top-0 left-1/4 w-96 h-96 rounded-full pointer-events-none"
        style={{
          background:
            "radial-gradient(circle, oklch(0.85 0.18 195 / 0.08) 0%, transparent 70%)",
          filter: "blur(40px)",
        }}
      />
      <div
        className="absolute bottom-1/4 right-1/4 w-80 h-80 rounded-full pointer-events-none"
        style={{
          background:
            "radial-gradient(circle, oklch(0.65 0.25 285 / 0.1) 0%, transparent 70%)",
          filter: "blur(40px)",
        }}
      />
      <div
        className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full pointer-events-none"
        style={{
          background:
            "radial-gradient(circle, oklch(0.82 0.2 150 / 0.04) 0%, transparent 60%)",
          filter: "blur(60px)",
        }}
      />

      {/* Floating coin icons in background */}
      {FLOATING_COINS.map((fc) => (
        <motion.div
          key={fc.symbol}
          className="absolute pointer-events-none select-none"
          style={{ left: `${fc.x}%`, top: `${fc.y}%`, opacity: fc.opacity }}
          animate={{ y: [0, -12, 0], rotate: [0, 5, -5, 0] }}
          transition={{
            duration: fc.duration,
            repeat: Number.POSITIVE_INFINITY,
            delay: fc.delay,
            ease: "easeInOut",
          }}
        >
          <CoinIcon symbol={fc.symbol} size={fc.size} />
        </motion.div>
      ))}

      {/* Floating particles */}
      {particles.map((p) => (
        <Particle key={p.id} x={p.x} y={p.y} delay={p.delay} />
      ))}

      {/* Main content */}
      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="show"
        className="relative z-10 text-center px-6 max-w-4xl mx-auto"
      >
        {/* Logo */}
        <motion.div
          variants={itemVariants}
          className="mb-8 flex justify-center"
        >
          <motion.div
            className="relative"
            animate={{ y: [0, -8, 0] }}
            transition={{
              duration: 3.5,
              repeat: Number.POSITIVE_INFINITY,
              ease: "easeInOut",
            }}
          >
            <div
              className="absolute inset-0 rounded-2xl"
              style={{
                background:
                  "radial-gradient(circle, oklch(0.85 0.18 195 / 0.2) 0%, transparent 70%)",
                filter: "blur(20px)",
                transform: "scale(1.4)",
              }}
            />
            <img
              src="/assets/generated/app-logo-transparent.dim_200x200.png"
              alt="CryptoVision Ultra Holo Logo"
              width={100}
              height={100}
              className="relative z-10 drop-shadow-[0_0_30px_oklch(0.85_0.18_195_/_0.5)]"
            />
          </motion.div>
        </motion.div>

        {/* Badge */}
        <motion.div
          variants={itemVariants}
          className="mb-4 flex justify-center"
        >
          <div
            className="glass-card px-4 py-1.5 text-xs font-mono tracking-widest uppercase flex items-center gap-2"
            style={{ borderColor: "oklch(0.85 0.18 195 / 0.4)" }}
          >
            <Zap
              className="w-3 h-3"
              style={{ color: "oklch(0.85 0.18 195)" }}
            />
            <span style={{ color: "oklch(0.85 0.18 195)" }}>
              Next-Gen Virtual Trading
            </span>
          </div>
        </motion.div>

        {/* Headline */}
        <motion.div variants={itemVariants} className="mb-6">
          <h1
            className={cn(
              "font-display font-bold leading-tight mb-3",
              "text-4xl sm:text-5xl lg:text-7xl",
              glitching ? "opacity-80" : "",
            )}
          >
            <span className="gradient-text-holo">CryptoVision</span>
            <br />
            <span className="gradient-text-holo">Ultra Holo</span>
          </h1>
          <p className="text-lg sm:text-xl text-muted-foreground font-sans max-w-lg mx-auto leading-relaxed">
            The future of virtual crypto trading.{" "}
            <span style={{ color: "oklch(0.85 0.18 195 / 0.9)" }}>
              Trade smarter,
            </span>{" "}
            <span style={{ color: "oklch(0.65 0.25 285 / 0.9)" }}>
              rank higher,
            </span>{" "}
            <span style={{ color: "oklch(0.82 0.2 150 / 0.9)" }}>
              learn faster.
            </span>
          </p>
        </motion.div>

        {/* Stats row */}
        <motion.div
          variants={itemVariants}
          className="flex flex-wrap justify-center gap-6 mb-10 text-center"
        >
          {[
            { value: "8", label: "Live Coins" },
            { value: "$10K", label: "Virtual Funds" },
            { value: "5", label: "Chart Types" },
            { value: "∞", label: "XP to Earn" },
          ].map((stat) => (
            <div key={stat.label} className="flex flex-col">
              <span
                className="font-display font-bold text-2xl"
                style={{
                  background:
                    "linear-gradient(135deg, oklch(0.85 0.18 195), oklch(0.65 0.25 285))",
                  WebkitBackgroundClip: "text",
                  WebkitTextFillColor: "transparent",
                  backgroundClip: "text",
                }}
              >
                {stat.value}
              </span>
              <span className="text-xs text-muted-foreground font-mono uppercase tracking-wider">
                {stat.label}
              </span>
            </div>
          ))}
        </motion.div>

        {/* CTA Button */}
        <motion.div
          variants={itemVariants}
          className="mb-16 flex flex-col items-center gap-3"
        >
          <motion.button
            type="button"
            onClick={onLaunch}
            className="relative group overflow-hidden font-display font-bold text-lg px-10 py-4 rounded-xl transition-all duration-300"
            style={{
              background:
                "linear-gradient(135deg, oklch(0.85 0.18 195 / 0.15), oklch(0.65 0.25 285 / 0.15))",
              border: "1.5px solid oklch(0.85 0.18 195 / 0.5)",
              color: "oklch(0.85 0.18 195)",
              boxShadow:
                "0 0 20px oklch(0.85 0.18 195 / 0.2), 0 0 40px oklch(0.85 0.18 195 / 0.1)",
            }}
            whileHover={{
              scale: 1.05,
              boxShadow:
                "0 0 30px oklch(0.85 0.18 195 / 0.4), 0 0 60px oklch(0.85 0.18 195 / 0.2)",
            }}
            whileTap={{ scale: 0.97 }}
          >
            {/* Shimmer overlay */}
            <motion.div
              className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity"
              style={{
                background:
                  "linear-gradient(90deg, transparent, oklch(0.85 0.18 195 / 0.1), transparent)",
              }}
              animate={{ x: [-200, 200] }}
              transition={{
                duration: 1.5,
                repeat: Number.POSITIVE_INFINITY,
                ease: "linear",
              }}
            />
            <span className="relative z-10 flex items-center gap-3">
              <Rocket className="w-5 h-5" />
              Launch App
              <span className="text-sm opacity-60 font-mono">→</span>
            </span>
          </motion.button>

          <AnimatePresence>
            {(canInstall || installed) && (
              <motion.button
                type="button"
                onClick={install}
                disabled={installed}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 8 }}
                transition={{ duration: 0.35, ease: "easeOut" }}
                className="relative group overflow-hidden font-display font-semibold text-base px-8 py-3 rounded-xl transition-all duration-300 disabled:cursor-default"
                style={{
                  background:
                    "linear-gradient(135deg, oklch(0.65 0.25 285 / 0.12), oklch(0.72 0.22 330 / 0.12))",
                  border: `1.5px solid ${installed ? "oklch(0.82 0.2 150 / 0.4)" : "oklch(0.65 0.25 285 / 0.5)"}`,
                  color: installed
                    ? "oklch(0.82 0.2 150)"
                    : "oklch(0.75 0.2 285)",
                  boxShadow: installed
                    ? "0 0 16px oklch(0.82 0.2 150 / 0.15)"
                    : "0 0 16px oklch(0.65 0.25 285 / 0.15)",
                }}
                whileHover={
                  installed
                    ? {}
                    : {
                        scale: 1.04,
                        boxShadow:
                          "0 0 24px oklch(0.65 0.25 285 / 0.3), 0 0 48px oklch(0.65 0.25 285 / 0.15)",
                      }
                }
                whileTap={installed ? {} : { scale: 0.97 }}
              >
                <span className="relative z-10 flex items-center gap-2.5">
                  <Download className="w-4 h-4" />
                  {installed ? "Installed!" : "Install App"}
                  {!installed && (
                    <span className="text-xs opacity-50 font-mono">
                      Win · Mac · Android · iOS
                    </span>
                  )}
                </span>
              </motion.button>
            )}
          </AnimatePresence>

          <p className="text-xs text-muted-foreground font-mono">
            No sign-up required · Fully simulated · Risk-free
          </p>
        </motion.div>

        {/* Feature cards */}
        <motion.div
          variants={containerVariants}
          className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4"
        >
          {FEATURES.map((f) => {
            const Icon = f.icon;
            return (
              <motion.div
                key={f.title}
                variants={itemVariants}
                className="glass-card p-4 text-left group hover:scale-[1.02] transition-transform duration-200 cursor-default"
                style={{ borderColor: `${f.color.replace(")", " / 0.2)")}` }}
                whileHover={{
                  borderColor: f.color.replace(")", " / 0.5)"),
                  boxShadow: `0 0 20px ${f.color.replace(")", " / 0.15)")}`,
                }}
              >
                <div
                  className="w-9 h-9 rounded-lg flex items-center justify-center mb-3"
                  style={{
                    background: f.color.replace(")", " / 0.1)"),
                    border: `1px solid ${f.color.replace(")", " / 0.3)")}`,
                  }}
                >
                  <Icon className="w-4 h-4" style={{ color: f.color }} />
                </div>
                <div
                  className="font-display font-bold text-sm mb-1"
                  style={{ color: f.color }}
                >
                  {f.title}
                </div>
                <div className="text-xs text-muted-foreground leading-relaxed">
                  {f.desc}
                </div>
              </motion.div>
            );
          })}
        </motion.div>

        {/* Coin preview row */}
        <motion.div
          variants={itemVariants}
          className="mt-10 flex justify-center items-center gap-3 flex-wrap"
        >
          <span className="text-xs text-muted-foreground font-mono uppercase tracking-wider">
            Trade
          </span>
          {COINS.map((symbol, i) => (
            <motion.div
              key={symbol}
              className="flex items-center gap-1.5 glass-card px-2.5 py-1.5 rounded-full"
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 1.2 + i * 0.07 }}
            >
              <CoinIcon symbol={symbol} size={16} />
              <span className="font-mono text-xs font-bold text-foreground/70">
                {symbol}
              </span>
            </motion.div>
          ))}
          <span className="text-xs text-muted-foreground font-mono uppercase tracking-wider">
            & more
          </span>
        </motion.div>
      </motion.div>

      {/* Security badge bottom */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 1.8 }}
        className="absolute bottom-4 left-1/2 -translate-x-1/2 flex items-center gap-2 text-xs text-muted-foreground"
      >
        <Shield className="w-3 h-3" />
        <span>© {new Date().getFullYear()}. </span>
        <a
          href={`https://caffeine.ai?utm_source=caffeine-footer&utm_medium=referral&utm_content=${encodeURIComponent(window.location.hostname)}`}
          target="_blank"
          rel="noopener noreferrer"
          className="hover:text-primary transition-colors"
        >
          Built with ❤ using caffeine.ai
        </a>
      </motion.div>
    </div>
  );
}
