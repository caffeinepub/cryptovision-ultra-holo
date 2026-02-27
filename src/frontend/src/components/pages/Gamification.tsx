import { Progress } from "@/components/ui/progress";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";
import { Crown, Medal, Star, Trophy, Users, Zap } from "lucide-react";
import { motion } from "motion/react";
import type { UserDataView } from "../../backend.d";
import type { CoinPrice } from "../../hooks/usePrices";
import { useLeaderboard } from "../../hooks/useQueries";
import type { Page } from "../../types/navigation";

interface GamificationProps {
  prices: Record<string, CoinPrice>;
  priceList: CoinPrice[];
  userData?: UserDataView;
  onNavigate: (page: Page) => void;
}

const BADGE_ICONS: Record<string, string> = {
  "First Trade": "🎯",
  "Diamond Hands": "💎",
  "Bull Rider": "🐂",
  "Bear Slayer": "⚔️",
  Whale: "🐋",
  "Day Trader": "⚡",
  HODLer: "🔒",
  Diversified: "🌈",
  default: "🏆",
};

const XP_LEVELS = [
  { level: 1, name: "Rookie Trader", min: 0, max: 100 },
  { level: 2, name: "Crypto Cadet", min: 100, max: 500 },
  { level: 3, name: "Market Analyst", min: 500, max: 2000 },
  { level: 4, name: "Chain Champion", min: 2000, max: 5000 },
  { level: 5, name: "Holo Master", min: 5000, max: 10000 },
];

function getLevel(xp: number) {
  return XP_LEVELS.findLast((l) => xp >= l.min) ?? XP_LEVELS[0];
}

const DEMO_BADGES = [
  { name: "First Trade", description: "Execute your first trade" },
  { name: "Diamond Hands", description: "Hold a position for 24 hours" },
  { name: "Bull Rider", description: "Profit during a bull market" },
  { name: "Day Trader", description: "Make 10 trades in a day" },
];

const container = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { staggerChildren: 0.07 } },
};

const item = {
  hidden: { opacity: 0, y: 16, scale: 0.97 },
  show: { opacity: 1, y: 0, scale: 1, transition: { duration: 0.35 } },
};

export default function Gamification({ userData }: GamificationProps) {
  const { data: leaderboard, isLoading } = useLeaderboard();

  const xp = Number(userData?.xp ?? 0);
  const badges = userData?.badges ?? DEMO_BADGES;
  const level = getLevel(xp);
  const nextLevel = XP_LEVELS[level.level] ?? level;
  const xpProgress =
    level.max > level.min
      ? ((xp - level.min) / (nextLevel.max - level.min)) * 100
      : 100;

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <h1 className="font-display text-2xl lg:text-3xl font-bold gradient-text-holo">
          Achievement Hub
        </h1>
        <p className="text-muted-foreground text-sm mt-1">
          Level up your trading game
        </p>
      </motion.div>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Left Column: XP + Badges */}
        <div className="lg:col-span-2 space-y-4">
          {/* XP Card */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0, transition: { delay: 0.1 } }}
          >
            <div className="glass-card neon-border-cyan p-5">
              <div className="flex items-start justify-between mb-4">
                <div>
                  <div className="text-xs text-muted-foreground uppercase tracking-wider mb-1">
                    Your Level
                  </div>
                  <div className="font-display font-bold text-2xl neon-cyan">
                    {level.name}
                  </div>
                  <div className="text-xs text-muted-foreground mt-0.5 font-mono">
                    Level {level.level}
                  </div>
                </div>
                <div className="w-14 h-14 rounded-full glass-card flex items-center justify-center neon-border-cyan animate-float">
                  <Zap className="w-7 h-7 text-primary" />
                </div>
              </div>

              <div className="space-y-2">
                <div className="flex justify-between text-xs text-muted-foreground font-mono">
                  <span>{xp.toLocaleString()} XP</span>
                  <span>{nextLevel.max.toLocaleString()} XP</span>
                </div>
                <div className="relative h-3 bg-muted/40 rounded-full overflow-hidden">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${xpProgress}%` }}
                    transition={{ duration: 1.2, ease: "easeOut", delay: 0.3 }}
                    className="h-full rounded-full"
                    style={{
                      background:
                        "linear-gradient(90deg, oklch(0.85 0.18 195), oklch(0.65 0.25 285))",
                      boxShadow: "0 0 10px oklch(0.85 0.18 195 / 0.6)",
                    }}
                  />
                </div>
                <div className="text-xs text-muted-foreground font-mono">
                  {(nextLevel.max - xp).toLocaleString()} XP to next level
                </div>
              </div>

              <div className="grid grid-cols-3 gap-2 mt-4">
                {XP_LEVELS.map((lvl) => (
                  <div
                    key={lvl.level}
                    className={cn(
                      "text-center py-2 rounded-lg text-xs font-mono transition-all",
                      level.level >= lvl.level
                        ? "bg-primary/20 text-primary border border-primary/30"
                        : "bg-muted/20 text-muted-foreground",
                    )}
                  >
                    <div className="font-bold">Lv.{lvl.level}</div>
                    <div className="text-[10px] opacity-70 truncate px-1">
                      {lvl.name.split(" ")[0]}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </motion.div>

          {/* Badges Grid */}
          <motion.div variants={container} initial="hidden" animate="show">
            <div className="glass-card p-5">
              <h2 className="font-display font-bold text-base neon-purple mb-4 flex items-center gap-2">
                <Star className="w-4 h-4" /> Badge Collection
                <span className="ml-auto text-xs font-mono text-muted-foreground">
                  {badges.length} earned
                </span>
              </h2>
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
                {badges.map((badge) => {
                  const icon = BADGE_ICONS[badge.name] ?? BADGE_ICONS.default;
                  return (
                    <motion.div key={badge.name} variants={item}>
                      <div className="glass-card-purple p-3 text-center hover:border-secondary/50 transition-all group">
                        <div className="text-2xl mb-2 group-hover:scale-110 transition-transform">
                          {icon}
                        </div>
                        <div className="font-mono font-bold text-xs text-foreground">
                          {badge.name}
                        </div>
                        <div className="text-[10px] text-muted-foreground mt-1 line-clamp-2">
                          {badge.description}
                        </div>
                      </div>
                    </motion.div>
                  );
                })}
                {/* Locked badge placeholders */}
                {Array.from(
                  { length: Math.max(0, 8 - badges.length) },
                  (_, i) => `locked-slot-${i}`,
                ).map((slotId) => (
                  <div
                    key={slotId}
                    className="glass-card p-3 text-center opacity-30"
                  >
                    <div className="text-2xl mb-2 grayscale">🔒</div>
                    <div className="font-mono text-xs text-muted-foreground">
                      Locked
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </motion.div>
        </div>

        {/* Leaderboard */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0, transition: { delay: 0.2 } }}
        >
          <div className="glass-card p-5 h-full">
            <h2 className="font-display font-bold text-base text-foreground mb-4 flex items-center gap-2">
              <Trophy className="w-4 h-4 text-neon-orange" />
              Leaderboard
            </h2>

            {isLoading ? (
              <div className="space-y-3">
                {Array.from({ length: 5 }, (_, i) => `skel-${i}`).map((id) => (
                  <Skeleton
                    key={id}
                    className="h-14 w-full rounded-lg bg-muted/30"
                  />
                ))}
              </div>
            ) : (leaderboard?.length ?? 0) === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <Users className="w-8 h-8 mx-auto mb-2 opacity-30" />
                <p className="text-sm">No traders yet. Be the first!</p>
              </div>
            ) : (
              <ScrollArea className="h-96">
                <div className="space-y-2 pr-1">
                  {(leaderboard ?? []).map(([principal, user], i) => {
                    const xpNum = Number(user.xp);
                    const rankIcons = ["👑", "🥈", "🥉"];
                    const rankIcon = rankIcons[i] ?? `#${i + 1}`;
                    const principalStr = principal.toString();
                    const shortPrincipal = `${principalStr.slice(0, 6)}...${principalStr.slice(-4)}`;

                    return (
                      <div
                        key={principalStr}
                        className={cn(
                          "flex items-center gap-3 p-3 rounded-lg transition-all",
                          i === 0
                            ? "bg-neon-orange/10 border border-neon-orange/30"
                            : i === 1
                              ? "bg-muted/30"
                              : i === 2
                                ? "bg-muted/20"
                                : "bg-muted/10",
                        )}
                      >
                        <div className="text-lg w-8 text-center flex-shrink-0">
                          {typeof rankIcon === "string" &&
                          rankIcon.startsWith("#") ? (
                            <span className="font-mono text-xs text-muted-foreground">
                              {rankIcon}
                            </span>
                          ) : (
                            rankIcon
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="font-mono text-xs font-bold text-foreground truncate">
                            {shortPrincipal}
                          </div>
                          <div className="text-xs text-muted-foreground">
                            {getLevel(xpNum).name}
                          </div>
                        </div>
                        <div className="text-right flex-shrink-0">
                          <div className="font-mono font-bold text-xs neon-cyan">
                            {xpNum.toLocaleString()} XP
                          </div>
                          <div className="text-[10px] text-muted-foreground">
                            {user.badges?.length ?? 0} badges
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
