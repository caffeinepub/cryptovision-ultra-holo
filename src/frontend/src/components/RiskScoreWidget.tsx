import { motion } from "motion/react";
import type { UserDataView } from "../backend.d";
import type { CoinPrice } from "../hooks/usePrices";

interface RiskScoreWidgetProps {
  userData?: UserDataView;
  prices: Record<string, CoinPrice>;
}

function calculateRiskScore(
  userData?: UserDataView,
  prices: Record<string, CoinPrice> = {},
): number {
  if (!userData) return 3;

  const holdings = Array.isArray(userData.portfolio) ? userData.portfolio : [];
  const cash = userData.balance ?? 0;

  if (holdings.length === 0) return 1;

  const holdingValues = holdings.map((h) => ({
    coin: h.coin,
    value: h.quantity * (prices[h.coin]?.price ?? 0),
  }));

  const totalHoldings = holdingValues.reduce((s, h) => s + h.value, 0);
  const totalPortfolio = totalHoldings + cash;

  if (totalPortfolio === 0) return 1;

  let score = 1;

  // Concentration risk: one coin > 50% of holdings
  const maxHolding = Math.max(...holdingValues.map((h) => h.value));
  const concentration = totalHoldings > 0 ? maxHolding / totalHoldings : 0;
  if (concentration > 0.8) score += 3;
  else if (concentration > 0.6) score += 2;
  else if (concentration > 0.4) score += 1;

  // Diversity bonus (more coins = lower risk)
  if (holdings.length >= 4) score -= 1;
  else if (holdings.length === 1) score += 2;
  else if (holdings.length === 2) score += 1;

  // Exposure ratio (holdings vs total)
  const exposure = totalPortfolio > 0 ? totalHoldings / totalPortfolio : 0;
  if (exposure > 0.9) score += 3;
  else if (exposure > 0.7) score += 2;
  else if (exposure > 0.5) score += 1;

  return Math.max(1, Math.min(10, Math.round(score)));
}

export default function RiskScoreWidget({
  userData,
  prices,
}: RiskScoreWidgetProps) {
  const score = calculateRiskScore(userData, prices);

  const label =
    score <= 3 ? "Low Risk" : score <= 6 ? "Medium Risk" : "High Risk";
  const color =
    score <= 3
      ? "oklch(0.82 0.2 150)"
      : score <= 6
        ? "oklch(0.78 0.2 55)"
        : "oklch(0.72 0.22 15)";

  // SVG arc math for semicircle gauge
  const radius = 44;
  const cx = 60;
  const cy = 60;
  const startAngle = -180;
  const endAngle = 0;
  const toRad = (deg: number) => (deg * Math.PI) / 180;

  const arcPath = (start: number, end: number) => {
    const x1 = cx + radius * Math.cos(toRad(start));
    const y1 = cy + radius * Math.sin(toRad(start));
    const x2 = cx + radius * Math.cos(toRad(end));
    const y2 = cy + radius * Math.sin(toRad(end));
    return `M ${x1} ${y1} A ${radius} ${radius} 0 0 1 ${x2} ${y2}`;
  };

  const progressAngle = startAngle + (score / 10) * (endAngle - startAngle);

  return (
    <div className="glass-card p-4">
      <div className="text-xs text-muted-foreground uppercase tracking-wider mb-3 font-mono">
        Risk Score
      </div>
      <div className="flex items-center gap-4">
        <div className="relative flex-shrink-0">
          <svg
            width="120"
            height="70"
            viewBox="0 0 120 70"
            role="img"
            aria-label={`Risk score: ${score}/10`}
          >
            <title>{`Risk score: ${score}/10`}</title>
            {/* Background arc */}
            <path
              d={arcPath(startAngle, endAngle)}
              fill="none"
              stroke="oklch(0.2 0.03 265)"
              strokeWidth="8"
              strokeLinecap="round"
            />
            {/* Progress arc */}
            <motion.path
              d={arcPath(startAngle, progressAngle)}
              fill="none"
              stroke={color}
              strokeWidth="8"
              strokeLinecap="round"
              initial={{ pathLength: 0 }}
              animate={{ pathLength: 1 }}
              transition={{ duration: 1.2, ease: "easeOut" }}
              style={{ filter: `drop-shadow(0 0 6px ${color})` }}
            />
            {/* Score text */}
            <text
              x={cx}
              y={cy - 4}
              textAnchor="middle"
              fill={color}
              fontSize="22"
              fontFamily="JetBrains Mono, monospace"
              fontWeight="bold"
            >
              {score}
            </text>
            <text
              x={cx}
              y={cy + 12}
              textAnchor="middle"
              fill="oklch(0.55 0.05 230)"
              fontSize="9"
              fontFamily="JetBrains Mono, monospace"
            >
              /10
            </text>
          </svg>
        </div>
        <div className="flex-1 min-w-0">
          <div className="font-display font-bold text-sm" style={{ color }}>
            {label}
          </div>
          <div className="text-xs text-muted-foreground mt-1 space-y-0.5">
            <div>
              Coins:{" "}
              {Array.isArray(userData?.portfolio)
                ? userData.portfolio.length
                : 0}
            </div>
            <div>
              Exposure:{" "}
              {userData
                ? (() => {
                    const holdings = Array.isArray(userData.portfolio)
                      ? userData.portfolio
                      : [];
                    const totalH = holdings.reduce(
                      (s, h) => s + h.quantity * (prices[h.coin]?.price ?? 0),
                      0,
                    );
                    const total = totalH + (userData.balance ?? 0);
                    return total > 0
                      ? `${((totalH / total) * 100).toFixed(0)}%`
                      : "0%";
                  })()
                : "0%"}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
