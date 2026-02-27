import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import {
  Loader2,
  LogIn,
  LogOut,
  Minus,
  Settings,
  TrendingDown,
  TrendingUp,
} from "lucide-react";
import { motion } from "motion/react";
import { useState } from "react";
import { toast } from "sonner";
import { MarketMode } from "../../backend.d";
import type { UserDataView } from "../../backend.d";
import { useMarketContext } from "../../contexts/MarketContext";
import { useInternetIdentity } from "../../hooks/useInternetIdentity";
import type { CoinPrice } from "../../hooks/usePrices";
import { useSetMarketMode } from "../../hooks/useQueries";
import type { Page } from "../../types/navigation";

interface SettingsProps {
  prices: Record<string, CoinPrice>;
  priceList: CoinPrice[];
  userData?: UserDataView;
  onNavigate: (page: Page) => void;
}

const MARKET_MODES = [
  {
    id: MarketMode.normal,
    label: "Normal Market",
    emoji: "◈",
    description:
      "Balanced market conditions with natural price fluctuations (±2%)",
    color: "neon-cyan",
    borderClass: "neon-border-cyan",
    bgClass: "bg-primary/10",
  },
  {
    id: MarketMode.bull,
    label: "Bull Market 🚀",
    emoji: "⬆",
    description:
      "Strong upward momentum. Prices drift higher on average. FOMO is real.",
    color: "neon-green",
    borderClass: "neon-border-green",
    bgClass: "bg-neon-green/10",
  },
  {
    id: MarketMode.bear,
    label: "Bear Market 🐻",
    emoji: "⬇",
    description:
      "Downward pressure across all assets. Test your diamond hands.",
    color: "neon-pink",
    borderClass: "border-neon-pink/50",
    bgClass: "bg-neon-pink/10",
  },
];

export default function SettingsPage({ userData }: SettingsProps) {
  const { marketMode, setMarketMode } = useMarketContext();
  const setMarketModeMutation = useSetMarketMode();
  const { login, clear, loginStatus, identity } = useInternetIdentity();

  const handleMarketModeChange = async (mode: MarketMode) => {
    setMarketMode(mode);
    try {
      await setMarketModeMutation.mutateAsync(mode);
      toast.success(`Market mode set to ${mode.toUpperCase()}`, {
        description:
          mode === MarketMode.bull
            ? "🚀 Get ready for a bull run!"
            : mode === MarketMode.bear
              ? "🐻 Hold tight, it's bear season."
              : "⚡ Normal market conditions restored.",
      });
    } catch {
      toast.error("Failed to update market mode on backend");
    }
  };

  const isLoggedIn = loginStatus === "success" || !!identity;

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <h1 className="font-display text-2xl lg:text-3xl font-bold gradient-text-holo">
          Settings
        </h1>
        <p className="text-muted-foreground text-sm mt-1">
          Configure your trading environment
        </p>
      </motion.div>

      {/* Market Simulation */}
      <motion.div
        variants={{ show: { opacity: 1, y: 0 } }}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0, transition: { delay: 0.1 } }}
      >
        <div className="glass-card p-5">
          <h2 className="font-display font-bold text-base neon-cyan mb-2 flex items-center gap-2">
            <Settings className="w-4 h-4" /> Market Simulation Mode
          </h2>
          <p className="text-sm text-muted-foreground mb-4">
            Control the market direction to test different trading strategies.
            This affects both frontend price simulation and backend state.
          </p>

          <div className="grid gap-3">
            {MARKET_MODES.map((mode) => {
              const isActive = marketMode === mode.id;
              const isPending =
                setMarketModeMutation.isPending &&
                setMarketModeMutation.variables === mode.id;

              return (
                <button
                  type="button"
                  key={mode.id}
                  onClick={() => handleMarketModeChange(mode.id)}
                  disabled={isActive || setMarketModeMutation.isPending}
                  className={cn(
                    "relative p-4 rounded-xl border text-left transition-all duration-200",
                    isActive
                      ? `${mode.borderClass} ${mode.bgClass}`
                      : "glass-card hover:bg-muted/30 hover:border-muted-foreground/30",
                  )}
                >
                  <div className="flex items-start gap-3">
                    <div
                      className={cn(
                        "w-10 h-10 rounded-lg flex items-center justify-center text-lg flex-shrink-0 glass-card",
                        isActive && mode.bgClass,
                      )}
                    >
                      {isPending ? (
                        <Loader2 className="w-5 h-5 animate-spin text-muted-foreground" />
                      ) : (
                        mode.emoji
                      )}
                    </div>
                    <div className="flex-1">
                      <div
                        className={cn(
                          "font-display font-bold text-sm mb-0.5",
                          isActive ? mode.color : "text-foreground",
                        )}
                      >
                        {mode.label}
                      </div>
                      <div className="text-xs text-muted-foreground">
                        {mode.description}
                      </div>
                    </div>
                    {isActive && (
                      <div
                        className={cn(
                          "text-xs font-mono font-bold px-2 py-0.5 rounded-full glass-card",
                          mode.color,
                        )}
                      >
                        ACTIVE
                      </div>
                    )}
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      </motion.div>

      {/* Account */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0, transition: { delay: 0.2 } }}
      >
        <div className="glass-card p-5">
          <h2 className="font-display font-bold text-base neon-purple mb-4 flex items-center gap-2">
            <LogIn className="w-4 h-4" /> Account
          </h2>

          {isLoggedIn ? (
            <div className="space-y-3">
              <div className="glass-card p-3 font-mono text-xs">
                <div className="text-muted-foreground mb-0.5">Principal</div>
                <div className="text-foreground break-all">
                  {identity?.getPrincipal().toString()}
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3 text-sm">
                <div className="glass-card p-3">
                  <div className="text-xs text-muted-foreground mb-1">XP</div>
                  <div className="font-mono font-bold neon-cyan">
                    {Number(userData?.xp ?? 0).toLocaleString()}
                  </div>
                </div>
                <div className="glass-card p-3">
                  <div className="text-xs text-muted-foreground mb-1">
                    Badges
                  </div>
                  <div className="font-mono font-bold neon-purple">
                    {userData?.badges?.length ?? 0}
                  </div>
                </div>
              </div>
              <Button
                onClick={clear}
                variant="outline"
                className="w-full border-destructive/40 text-destructive hover:bg-destructive/10"
              >
                <LogOut className="w-4 h-4 mr-2" />
                Sign Out
              </Button>
            </div>
          ) : (
            <div className="space-y-3">
              <p className="text-sm text-muted-foreground">
                Sign in with Internet Identity to save your progress, compete on
                the leaderboard, and access all features.
              </p>
              <Button
                onClick={() => login()}
                disabled={loginStatus === "logging-in"}
                className="w-full bg-primary/20 hover:bg-primary/30 text-primary border border-primary/50 hover:shadow-neon-cyan transition-all font-bold"
              >
                {loginStatus === "logging-in" ? (
                  <Loader2 className="w-4 h-4 animate-spin mr-2" />
                ) : (
                  <LogIn className="w-4 h-4 mr-2" />
                )}
                {loginStatus === "logging-in" ? "Signing in..." : "Sign In"}
              </Button>
            </div>
          )}
        </div>
      </motion.div>

      {/* About */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0, transition: { delay: 0.3 } }}
      >
        <div className="glass-card p-5">
          <h2 className="font-display font-bold text-base text-foreground mb-3">
            About CryptoVision Ultra Holo
          </h2>
          <div className="space-y-2 text-sm text-muted-foreground">
            <p>
              A futuristic holographic crypto trading simulator built on the
              Internet Computer.
            </p>
            <p className="font-mono text-xs glass-card px-3 py-2 rounded">
              Version: 1.0.0 | Network: ICP Mainnet
            </p>
            <p className="text-xs">
              ⚠️ All trading is simulated with virtual funds. No real
              cryptocurrency is involved. Price data is randomly generated for
              educational and entertainment purposes.
            </p>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
