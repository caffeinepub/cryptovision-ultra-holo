import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { cn } from "@/lib/utils";
import { Bell, BellOff, CheckCircle2, Clock, Plus, Trash2 } from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { useState } from "react";
import type { UserDataView } from "../../backend.d";
import { type AlertDirection, useAlerts } from "../../contexts/AlertsContext";
import type { CoinPrice } from "../../hooks/usePrices";
import type { Page } from "../../types/navigation";

interface AlertsProps {
  prices: Record<string, CoinPrice>;
  priceList: CoinPrice[];
  userData?: UserDataView;
  onNavigate: (page: Page) => void;
}

export default function Alerts({ prices, priceList }: AlertsProps) {
  const { alerts, addAlert, removeAlert } = useAlerts();
  const [coin, setCoin] = useState("BTC");
  const [targetPrice, setTargetPrice] = useState("");
  const [direction, setDirection] = useState<AlertDirection>("above");

  const handleAdd = () => {
    const price = Number.parseFloat(targetPrice);
    if (Number.isNaN(price) || price <= 0) return;
    addAlert(coin, price, direction);
    setTargetPrice("");
  };

  const activeAlerts = alerts.filter((a) => !a.triggered);
  const triggeredAlerts = alerts.filter((a) => a.triggered);
  const selectedCoin = prices[coin];

  const container = {
    hidden: { opacity: 0 },
    show: { opacity: 1, transition: { staggerChildren: 0.07 } },
  };

  const item = {
    hidden: { opacity: 0, x: -10 },
    show: { opacity: 1, x: 0 },
    exit: { opacity: 0, x: 10, transition: { duration: 0.2 } },
  };

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <h1 className="font-display text-2xl lg:text-3xl font-bold gradient-text-holo">
          Price Alerts
        </h1>
        <p className="text-muted-foreground text-sm mt-1">
          Get notified when prices hit your targets
        </p>
      </motion.div>

      <div className="grid lg:grid-cols-5 gap-6">
        {/* Create Alert Form */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0, transition: { delay: 0.1 } }}
          className="lg:col-span-2"
        >
          <div className="glass-card neon-border-cyan p-5 space-y-4">
            <h2 className="font-display font-bold text-base neon-cyan flex items-center gap-2">
              <Plus className="w-4 h-4" /> New Alert
            </h2>

            {/* Coin Select */}
            <div>
              <Label className="text-xs text-muted-foreground mb-1.5 block">
                Coin
              </Label>
              <Select value={coin} onValueChange={setCoin}>
                <SelectTrigger className="bg-muted/30 border-primary/20">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="glass-card border-primary/20">
                  {priceList.map((c) => (
                    <SelectItem key={c.symbol} value={c.symbol}>
                      <span className="flex items-center gap-2 font-mono">
                        <span style={{ color: c.color }}>{c.emoji}</span>
                        {c.symbol} — $
                        {c.price >= 1 ? c.price.toFixed(2) : c.price.toFixed(4)}
                      </span>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Direction */}
            <div>
              <Label className="text-xs text-muted-foreground mb-1.5 block">
                Direction
              </Label>
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => setDirection("above")}
                  className={cn(
                    "flex-1 py-2 rounded-lg text-sm font-mono font-bold transition-all",
                    direction === "above"
                      ? "bg-neon-green/20 border border-neon-green/50 neon-green"
                      : "glass-card text-muted-foreground hover:text-foreground",
                  )}
                >
                  ▲ Above
                </button>
                <button
                  type="button"
                  onClick={() => setDirection("below")}
                  className={cn(
                    "flex-1 py-2 rounded-lg text-sm font-mono font-bold transition-all",
                    direction === "below"
                      ? "bg-neon-pink/20 border border-neon-pink/50 neon-pink"
                      : "glass-card text-muted-foreground hover:text-foreground",
                  )}
                >
                  ▼ Below
                </button>
              </div>
            </div>

            {/* Target Price */}
            <div>
              <Label
                htmlFor="target"
                className="text-xs text-muted-foreground mb-1.5 block"
              >
                Target Price (USD)
              </Label>
              <Input
                id="target"
                type="number"
                step="any"
                min="0"
                placeholder="0.00"
                value={targetPrice}
                onChange={(e) => setTargetPrice(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleAdd()}
                className="bg-muted/30 border-primary/20 focus:border-primary/60 font-mono"
              />
            </div>

            {/* Current Price Hint */}
            {selectedCoin && (
              <div className="text-xs text-muted-foreground font-mono bg-muted/20 rounded px-3 py-2">
                Current {coin}:{" "}
                <span className="neon-cyan">
                  $
                  {selectedCoin.price >= 1
                    ? selectedCoin.price.toFixed(2)
                    : selectedCoin.price.toFixed(4)}
                </span>
              </div>
            )}

            <Button
              onClick={handleAdd}
              disabled={!targetPrice || Number.parseFloat(targetPrice) <= 0}
              className="w-full bg-primary/20 hover:bg-primary/30 text-primary border border-primary/50 hover:shadow-neon-cyan transition-all font-bold"
            >
              <Bell className="w-4 h-4 mr-2" />
              Set Alert
            </Button>
          </div>
        </motion.div>

        {/* Alerts List */}
        <div className="lg:col-span-3 space-y-4">
          {/* Active Alerts */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0, transition: { delay: 0.15 } }}
          >
            <div className="glass-card p-4">
              <h2 className="font-display font-bold text-base text-foreground mb-3 flex items-center gap-2">
                <Bell className="w-4 h-4 text-primary" />
                Active Alerts
                <Badge className="ml-auto bg-primary/20 text-primary border-primary/40 font-mono">
                  {activeAlerts.length}
                </Badge>
              </h2>

              {activeAlerts.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  <BellOff className="w-8 h-8 mx-auto mb-2 opacity-30" />
                  <p className="text-sm">
                    No active alerts. Create one to get started.
                  </p>
                </div>
              ) : (
                <motion.div
                  variants={container}
                  initial="hidden"
                  animate="show"
                  className="space-y-2"
                >
                  <AnimatePresence>
                    {activeAlerts.map((alert) => {
                      const coinData = prices[alert.coin];
                      const currentPrice = coinData?.price ?? 0;
                      const progress =
                        alert.direction === "above"
                          ? Math.min(
                              (currentPrice / alert.targetPrice) * 100,
                              100,
                            )
                          : Math.min(
                              ((alert.targetPrice - currentPrice) /
                                alert.targetPrice +
                                0.5) *
                                100,
                              100,
                            );

                      return (
                        <motion.div
                          key={alert.id}
                          variants={item}
                          exit="exit"
                          layout
                          className="flex items-center gap-3 p-3 rounded-lg bg-muted/20 hover:bg-muted/30 transition-all"
                        >
                          <div
                            className="w-8 h-8 rounded-full flex items-center justify-center text-sm flex-shrink-0"
                            style={{
                              color: coinData?.color ?? "#fff",
                              background: `${coinData?.color ?? "#fff"}20`,
                            }}
                          >
                            {coinData?.emoji}
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 text-sm">
                              <span className="font-mono font-bold">
                                {alert.coin}
                              </span>
                              <span
                                className={cn(
                                  "text-xs",
                                  alert.direction === "above"
                                    ? "price-up"
                                    : "price-down",
                                )}
                              >
                                {alert.direction === "above" ? "▲" : "▼"}
                              </span>
                              <span className="font-mono font-bold">
                                $
                                {alert.targetPrice >= 1
                                  ? alert.targetPrice.toFixed(2)
                                  : alert.targetPrice.toFixed(4)}
                              </span>
                            </div>
                            <div className="text-xs text-muted-foreground mt-0.5 font-mono">
                              Now: $
                              {currentPrice >= 1
                                ? currentPrice.toFixed(2)
                                : currentPrice.toFixed(4)}
                            </div>
                            <div className="w-full h-1 bg-muted/40 rounded-full mt-1.5 overflow-hidden">
                              <div
                                className="h-full rounded-full transition-all duration-500"
                                style={{
                                  width: `${Math.min(progress, 100)}%`,
                                  background:
                                    alert.direction === "above"
                                      ? "oklch(0.82 0.2 150)"
                                      : "oklch(0.72 0.22 330)",
                                }}
                              />
                            </div>
                          </div>
                          <button
                            type="button"
                            onClick={() => removeAlert(alert.id)}
                            className="p-1.5 rounded-lg hover:bg-destructive/20 text-muted-foreground hover:text-destructive transition-colors flex-shrink-0"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </motion.div>
                      );
                    })}
                  </AnimatePresence>
                </motion.div>
              )}
            </div>
          </motion.div>

          {/* Triggered Alerts */}
          {triggeredAlerts.length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0, transition: { delay: 0.25 } }}
            >
              <div className="glass-card-green p-4">
                <h2 className="font-display font-bold text-base neon-green mb-3 flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4" />
                  Triggered Alerts
                  <Badge className="ml-auto bg-neon-green/20 text-neon-green border-neon-green/40 font-mono">
                    {triggeredAlerts.length}
                  </Badge>
                </h2>
                <div className="space-y-2">
                  {triggeredAlerts.map((alert) => {
                    return (
                      <div
                        key={alert.id}
                        className="flex items-center gap-3 p-3 rounded-lg bg-neon-green/5 border border-neon-green/20"
                      >
                        <CheckCircle2 className="w-5 h-5 neon-green flex-shrink-0" />
                        <div className="flex-1 min-w-0">
                          <div className="text-sm font-mono font-bold">
                            {alert.coin}{" "}
                            <span className="text-muted-foreground">
                              {alert.direction} $
                              {alert.targetPrice >= 1
                                ? alert.targetPrice.toFixed(2)
                                : alert.targetPrice.toFixed(4)}
                            </span>
                          </div>
                          <div className="text-xs text-muted-foreground flex items-center gap-1 mt-0.5">
                            <Clock className="w-3 h-3" />
                            {alert.createdAt.toLocaleDateString()}
                          </div>
                        </div>
                        <button
                          type="button"
                          onClick={() => removeAlert(alert.id)}
                          className="p-1.5 hover:bg-destructive/20 rounded text-muted-foreground hover:text-destructive transition-colors"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    );
                  })}
                </div>
              </div>
            </motion.div>
          )}
        </div>
      </div>
    </div>
  );
}
