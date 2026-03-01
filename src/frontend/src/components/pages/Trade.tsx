import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";
import {
  Loader2,
  Minus,
  RefreshCw,
  ShoppingCart,
  Target,
  TrendingDown,
  TrendingUp,
  X,
} from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { useState } from "react";
import { toast } from "sonner";
import type { UserDataView } from "../../backend.d";
import type { AutoSellOrder } from "../../hooks/useAutoSellOrders";
import { useAutoSellOrders } from "../../hooks/useAutoSellOrders";
import type { CoinPrice } from "../../hooks/usePrices";
import { useBuy, useResetAccount, useSell } from "../../hooks/useQueries";
import type { Page } from "../../types/navigation";
import CoinIcon from "../CoinIcon";
import TiltCard from "../TiltCard";

interface TradeProps {
  prices: Record<string, CoinPrice>;
  priceList: CoinPrice[];
  userData?: UserDataView;
  onNavigate: (page: Page) => void;
}

type ModalMode = "buy" | "sell";

function formatUSD(n: number) {
  if (n >= 1)
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      maximumFractionDigits: 2,
    }).format(n);
  return `$${n.toFixed(6)}`;
}

function SparkMini({ data, up }: { data: number[]; up: boolean }) {
  const min = Math.min(...data);
  const max = Math.max(...data);
  const range = max - min || 1;
  const points = data
    .map(
      (v, i) =>
        `${(i / (data.length - 1)) * 100},${100 - ((v - min) / range) * 100}`,
    )
    .join(" ");
  return (
    <svg
      viewBox="0 0 100 100"
      className="w-16 h-8"
      preserveAspectRatio="none"
      aria-hidden="true"
    >
      <polyline
        points={points}
        fill="none"
        stroke={up ? "oklch(0.82 0.2 150)" : "oklch(0.72 0.22 330)"}
        strokeWidth="3"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function AutoSellSection({
  coin,
  holding,
  addOrder,
}: {
  coin: CoinPrice;
  holding: number;
  addOrder: (o: Omit<AutoSellOrder, "id" | "createdAt">) => void;
}) {
  const [stopLoss, setStopLoss] = useState("");
  const [takeProfit, setTakeProfit] = useState("");

  const handleSet = (type: "stop-loss" | "take-profit") => {
    const price =
      type === "stop-loss"
        ? Number.parseFloat(stopLoss)
        : Number.parseFloat(takeProfit);
    if (!price || price <= 0) {
      toast.error("Enter a valid price");
      return;
    }
    if (holding <= 0) {
      toast.error(`You have no ${coin.symbol} to set an auto-sell for`);
      return;
    }
    addOrder({
      coin: coin.symbol,
      type,
      triggerPrice: price,
      quantity: holding,
    });
    if (type === "stop-loss") setStopLoss("");
    else setTakeProfit("");
  };

  return (
    <div className="glass-card p-4 space-y-3 border-accent/20">
      <div className="flex items-center gap-2 text-xs text-muted-foreground font-mono uppercase tracking-wider">
        <Target className="w-3.5 h-3.5 text-accent" />
        Auto-Sell Orders
      </div>
      <div className="grid grid-cols-2 gap-3">
        <div className="space-y-1.5">
          <Label className="text-xs text-muted-foreground">Stop Loss ($)</Label>
          <div className="flex gap-1.5">
            <Input
              type="number"
              placeholder={`< ${formatUSD(coin.price)}`}
              value={stopLoss}
              onChange={(e) => setStopLoss(e.target.value)}
              className="bg-muted/20 border-destructive/20 focus:border-destructive/50 font-mono text-xs h-8"
            />
            <Button
              size="sm"
              onClick={() => handleSet("stop-loss")}
              className="h-8 px-2 bg-destructive/15 hover:bg-destructive/30 text-destructive border border-destructive/30 text-xs"
            >
              Set
            </Button>
          </div>
        </div>
        <div className="space-y-1.5">
          <Label className="text-xs text-muted-foreground">
            Take Profit ($)
          </Label>
          <div className="flex gap-1.5">
            <Input
              type="number"
              placeholder={`> ${formatUSD(coin.price)}`}
              value={takeProfit}
              onChange={(e) => setTakeProfit(e.target.value)}
              className="bg-muted/20 border-accent/20 focus:border-accent/50 font-mono text-xs h-8"
            />
            <Button
              size="sm"
              onClick={() => handleSet("take-profit")}
              className="h-8 px-2 bg-accent/15 hover:bg-accent/30 text-accent border border-accent/30 text-xs"
            >
              Set
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}

function ActiveOrders({
  orders,
  cancelOrder,
  prices,
}: {
  orders: AutoSellOrder[];
  cancelOrder: (id: string) => void;
  prices: Record<string, CoinPrice>;
}) {
  if (orders.length === 0) return null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="glass-card p-4 space-y-2"
    >
      <div className="text-xs text-muted-foreground font-mono uppercase tracking-wider flex items-center gap-2">
        <Target className="w-3.5 h-3.5 text-primary" />
        Active Auto-Sell Orders ({orders.length})
      </div>
      {orders.map((order) => {
        const coinPrice = prices[order.coin]?.price ?? 0;
        const isStopLoss = order.type === "stop-loss";
        return (
          <div
            key={order.id}
            className={cn(
              "flex items-center justify-between p-2.5 rounded-lg text-xs",
              isStopLoss
                ? "bg-destructive/10 border border-destructive/20"
                : "bg-accent/10 border border-accent/20",
            )}
          >
            <div className="flex items-center gap-2">
              <CoinIcon symbol={order.coin} size={16} />
              <span className="font-mono font-bold">{order.coin}</span>
              <span
                className={cn(
                  "font-mono px-1.5 py-0.5 rounded text-[10px] font-bold",
                  isStopLoss
                    ? "bg-destructive/20 text-destructive"
                    : "bg-accent/20 text-accent",
                )}
              >
                {isStopLoss ? "STOP" : "TAKE"}
              </span>
            </div>
            <div className="flex items-center gap-3">
              <div className="text-right font-mono">
                <div
                  className={isStopLoss ? "text-destructive" : "text-accent"}
                >
                  @ {formatUSD(order.triggerPrice)}
                </div>
                <div className="text-muted-foreground">
                  now {formatUSD(coinPrice)}
                </div>
              </div>
              <button
                type="button"
                onClick={() => cancelOrder(order.id)}
                className="p-1 hover:bg-muted/50 rounded transition-colors"
              >
                <X className="w-3.5 h-3.5 text-muted-foreground hover:text-foreground" />
              </button>
            </div>
          </div>
        );
      })}
    </motion.div>
  );
}

function TradeModal({
  coin,
  mode,
  userData,
  onClose,
  addOrder,
}: {
  coin: CoinPrice;
  mode: ModalMode;
  userData?: UserDataView;
  onClose: () => void;
  addOrder: (o: Omit<AutoSellOrder, "id" | "createdAt">) => void;
}) {
  const [amount, setAmount] = useState("");
  const [showAutoSell, setShowAutoSell] = useState(false);
  const buyMutation = useBuy();
  const sellMutation = useSell();

  const holding = Array.isArray(userData?.portfolio)
    ? (userData.portfolio.find(
        (h: { coin: string; quantity: number }) => h.coin === coin.symbol,
      )?.quantity ?? 0)
    : 0;

  const isLoading = buyMutation.isPending || sellMutation.isPending;

  const handleSubmit = async () => {
    const val = Number.parseFloat(amount);
    if (Number.isNaN(val) || val <= 0) {
      toast.error("Invalid amount");
      return;
    }
    try {
      if (mode === "buy") {
        if (val > (userData?.balance ?? 0)) {
          toast.error("Insufficient balance");
          return;
        }
        await buyMutation.mutateAsync({ coin: coin.symbol, usdAmount: val });
        const qty = val / coin.price;
        toast.success(`✅ Bought ${qty.toFixed(6)} ${coin.symbol}`, {
          description: `Spent ${formatUSD(val)} at ${formatUSD(coin.price)}`,
        });
        setShowAutoSell(true);
      } else {
        if (val > holding) {
          toast.error(
            `Insufficient ${coin.symbol}. You have ${holding.toFixed(6)}`,
          );
          return;
        }
        await sellMutation.mutateAsync({ coin: coin.symbol, quantity: val });
        const proceeds = val * coin.price;
        toast.success(`✅ Sold ${val} ${coin.symbol}`, {
          description: `Received ${formatUSD(proceeds)} at ${formatUSD(coin.price)}`,
        });
        onClose();
      }
    } catch {
      toast.error("Trade failed. Please try again.");
    }
  };

  const isBuy = mode === "buy";
  const val = Number.parseFloat(amount) || 0;
  const estimatedQty = isBuy ? val / coin.price : val;
  const estimatedValue = isBuy ? val : val * coin.price;
  const newHolding = isBuy ? holding + val / coin.price : 0;

  return (
    <DialogContent className="glass-card border-primary/30 max-w-sm">
      <DialogHeader>
        <DialogTitle className="flex items-center gap-2 font-display">
          <span className="coin-3d">
            <CoinIcon symbol={coin.symbol} size={28} />
          </span>
          <span className={isBuy ? "neon-cyan" : "neon-pink"}>
            {isBuy ? "Buy" : "Sell"} {coin.symbol}
          </span>
        </DialogTitle>
        <DialogDescription className="text-muted-foreground">
          Current price:{" "}
          <span className="font-mono text-foreground">
            {formatUSD(coin.price)}
          </span>
        </DialogDescription>
      </DialogHeader>

      <div className="space-y-4 py-2">
        <div className="glass-card p-3 flex justify-between text-sm">
          <span className="text-muted-foreground">
            {isBuy ? "Available Balance" : "Your Holdings"}
          </span>
          <span className="font-mono font-bold text-foreground">
            {isBuy
              ? formatUSD(userData?.balance ?? 0)
              : `${holding.toFixed(6)} ${coin.symbol}`}
          </span>
        </div>

        <div>
          <Label
            htmlFor="amount"
            className="text-xs text-muted-foreground mb-1.5 block"
          >
            {isBuy ? "Amount (USD)" : `Quantity (${coin.symbol})`}
          </Label>
          <Input
            id="amount"
            type="number"
            step="any"
            min="0"
            placeholder={isBuy ? "0.00" : "0.000000"}
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            className="bg-muted/30 border-primary/20 focus:border-primary/60 font-mono"
          />
        </div>

        {/* Quick amounts */}
        <div className="flex gap-2">
          {isBuy
            ? ["25%", "50%", "75%", "100%"].map((pct) => (
                <button
                  type="button"
                  key={pct}
                  onClick={() =>
                    setAmount(
                      String(
                        (
                          ((userData?.balance ?? 0) * Number.parseInt(pct)) /
                          100
                        ).toFixed(2),
                      ),
                    )
                  }
                  className="flex-1 text-xs py-1 rounded glass-card hover:bg-primary/20 hover:border-primary/40 transition-all"
                >
                  {pct}
                </button>
              ))
            : ["25%", "50%", "75%", "100%"].map((pct) => (
                <button
                  type="button"
                  key={pct}
                  onClick={() =>
                    setAmount(
                      String(
                        ((holding * Number.parseInt(pct)) / 100).toFixed(6),
                      ),
                    )
                  }
                  className="flex-1 text-xs py-1 rounded glass-card hover:bg-destructive/20 hover:border-destructive/40 transition-all"
                >
                  {pct}
                </button>
              ))}
        </div>

        {/* Estimate */}
        {val > 0 && (
          <div className="glass-card p-3 space-y-1 text-sm">
            <div className="flex justify-between">
              <span className="text-muted-foreground">You'll receive</span>
              <span className="font-mono text-foreground">
                {isBuy
                  ? `${estimatedQty.toFixed(6)} ${coin.symbol}`
                  : formatUSD(estimatedValue)}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">At price</span>
              <span className="font-mono text-foreground">
                {formatUSD(coin.price)}
              </span>
            </div>
          </div>
        )}

        {/* Auto-sell after successful buy */}
        {showAutoSell && isBuy && (
          <AutoSellSection
            coin={coin}
            holding={newHolding}
            addOrder={addOrder}
          />
        )}

        <div className="flex gap-3 pt-1">
          <Button
            variant="outline"
            onClick={onClose}
            className="flex-1 border-muted hover:bg-muted/30"
          >
            Cancel
          </Button>
          {!showAutoSell && (
            <Button
              onClick={handleSubmit}
              disabled={isLoading || !amount}
              className={cn(
                "flex-1 font-bold",
                isBuy
                  ? "bg-primary/20 hover:bg-primary/30 text-primary border border-primary/50 hover:shadow-neon-cyan"
                  : "bg-destructive/20 hover:bg-destructive/30 text-destructive border border-destructive/50",
              )}
            >
              {isLoading ? (
                <Loader2 className="w-4 h-4 animate-spin mr-2" />
              ) : isBuy ? (
                <ShoppingCart className="w-4 h-4 mr-2" />
              ) : (
                <Minus className="w-4 h-4 mr-2" />
              )}
              {isLoading ? "Processing..." : isBuy ? "Buy Now" : "Sell Now"}
            </Button>
          )}
          {showAutoSell && (
            <Button
              onClick={onClose}
              className="flex-1 font-bold bg-accent/20 hover:bg-accent/30 text-accent border border-accent/30"
            >
              Done
            </Button>
          )}
        </div>
      </div>
    </DialogContent>
  );
}

const containerV = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { staggerChildren: 0.05 } },
};

const itemVariant = {
  hidden: { opacity: 0, x: -10 },
  show: { opacity: 1, x: 0, transition: { duration: 0.3 } },
};

function BrokeBanner({ userData }: { userData?: UserDataView }) {
  const resetMutation = useResetAccount();
  const [confirmed, setConfirmed] = useState(false);

  const balance = userData?.balance ?? 10000;
  const hasHoldings =
    Array.isArray(userData?.portfolio) && userData.portfolio.length > 0;
  const isBroke = balance < 1 && !hasHoldings;

  if (!isBroke) return null;

  const handleReset = async () => {
    if (!confirmed) {
      setConfirmed(true);
      return;
    }
    try {
      await resetMutation.mutateAsync();
      toast.success("Account restarted! You have $10,000 to trade again.", {
        description: "Good luck this time!",
      });
      setConfirmed(false);
    } catch {
      toast.error("Failed to restart. Please try again.");
      setConfirmed(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.97 }}
      animate={{ opacity: 1, scale: 1 }}
      className="glass-card border-destructive/40 bg-destructive/10 p-5 rounded-xl flex flex-col sm:flex-row items-center gap-4 mb-2"
    >
      <div className="text-3xl">💸</div>
      <div className="flex-1 text-center sm:text-left">
        <p className="font-display font-bold text-destructive text-lg">
          You ran out of money!
        </p>
        <p className="text-sm text-muted-foreground mt-0.5">
          Your balance is empty and you have no holdings left. Restart your
          account to get a fresh $10,000 and try again.
        </p>
      </div>
      <Button
        onClick={handleReset}
        disabled={resetMutation.isPending}
        className={cn(
          "font-bold shrink-0 transition-all",
          confirmed
            ? "bg-destructive/80 hover:bg-destructive text-white border border-destructive"
            : "bg-primary/20 hover:bg-primary/30 text-primary border border-primary/50 hover:shadow-neon-cyan",
        )}
      >
        {resetMutation.isPending ? (
          <Loader2 className="w-4 h-4 animate-spin mr-2" />
        ) : (
          <RefreshCw className="w-4 h-4 mr-2" />
        )}
        {resetMutation.isPending
          ? "Restarting..."
          : confirmed
            ? "Confirm Restart"
            : "Restart Account"}
      </Button>
    </motion.div>
  );
}

export default function Trade({ prices, priceList, userData }: TradeProps) {
  const [selectedCoin, setSelectedCoin] = useState<CoinPrice | null>(null);
  const [modalMode, setModalMode] = useState<ModalMode>("buy");
  const [search, setSearch] = useState("");
  const { orders, addOrder, cancelOrder } = useAutoSellOrders(prices);

  const filtered = priceList.filter(
    (c) =>
      c.symbol.toLowerCase().includes(search.toLowerCase()) ||
      c.name.toLowerCase().includes(search.toLowerCase()),
  );

  const openModal = (coin: CoinPrice, mode: ModalMode) => {
    setSelectedCoin(coin);
    setModalMode(mode);
  };

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <h1 className="font-display text-2xl lg:text-3xl font-bold gradient-text-holo">
          Trade Terminal
        </h1>
        <p className="text-muted-foreground text-sm mt-1">
          Balance:{" "}
          <span className="neon-cyan font-mono font-bold">
            {new Intl.NumberFormat("en-US", {
              style: "currency",
              currency: "USD",
            }).format(userData?.balance ?? 10000)}
          </span>
        </p>
      </motion.div>

      {/* Broke banner */}
      <BrokeBanner userData={userData} />

      {/* Active orders */}
      <ActiveOrders orders={orders} cancelOrder={cancelOrder} prices={prices} />

      {/* Search */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1, transition: { delay: 0.1 } }}
      >
        <Input
          placeholder="Search coins..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="bg-muted/30 border-primary/20 focus:border-primary/60 font-mono max-w-md"
        />
      </motion.div>

      {/* Coin Cards */}
      <motion.div
        variants={containerV}
        initial="hidden"
        animate="show"
        className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4"
      >
        {filtered.map((coin) => {
          const up = coin.changePercent24h >= 0;
          const holding = Array.isArray(userData?.portfolio)
            ? (userData.portfolio.find(
                (h: { coin: string; quantity: number }) =>
                  h.coin === coin.symbol,
              )?.quantity ?? 0)
            : 0;

          return (
            <motion.div key={coin.symbol} variants={itemVariant}>
              <TiltCard maxTilt={6}>
                <div className="glass-liquid glass-refract p-4 space-y-3 hover:border-primary/30 transition-all group cursor-default h-full">
                  {/* Header */}
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div
                        className="w-9 h-9 rounded-full flex items-center justify-center coin-3d glass-card overflow-hidden"
                        style={{
                          boxShadow: `0 0 12px ${coin.color}30`,
                        }}
                      >
                        <CoinIcon symbol={coin.symbol} size={30} />
                      </div>
                      <div>
                        <div className="font-mono font-bold text-sm">
                          {coin.symbol}
                        </div>
                        <div className="text-xs text-muted-foreground">
                          {coin.name}
                        </div>
                      </div>
                    </div>
                    <SparkMini data={coin.history} up={up} />
                  </div>

                  {/* Price */}
                  <div>
                    <div className="font-display font-bold text-lg">
                      {coin.price >= 1
                        ? new Intl.NumberFormat("en-US", {
                            style: "currency",
                            currency: "USD",
                            maximumFractionDigits: 2,
                          }).format(coin.price)
                        : `$${coin.price.toFixed(4)}`}
                    </div>
                    <div
                      className={cn(
                        "text-xs font-mono flex items-center gap-1",
                        up ? "price-up" : "price-down",
                      )}
                    >
                      {up ? (
                        <TrendingUp className="w-3 h-3" />
                      ) : (
                        <TrendingDown className="w-3 h-3" />
                      )}
                      {up ? "+" : ""}
                      {coin.changePercent24h.toFixed(2)}%
                    </div>
                  </div>

                  {/* Holdings */}
                  {holding > 0 && (
                    <div className="text-xs text-muted-foreground font-mono bg-muted/20 rounded px-2 py-1">
                      Holdings: {holding.toFixed(6)} {coin.symbol}
                    </div>
                  )}

                  {/* Action Buttons */}
                  <div className="flex gap-2">
                    <Button
                      size="sm"
                      onClick={() => openModal(coin, "buy")}
                      className="flex-1 h-8 text-xs bg-primary/15 hover:bg-primary/30 text-primary border border-primary/40 hover:shadow-neon-cyan transition-all"
                    >
                      Buy
                    </Button>
                    <Button
                      size="sm"
                      onClick={() => openModal(coin, "sell")}
                      disabled={holding <= 0}
                      className="flex-1 h-8 text-xs bg-destructive/15 hover:bg-destructive/30 text-destructive border border-destructive/40 disabled:opacity-30 transition-all"
                    >
                      Sell
                    </Button>
                  </div>
                </div>
              </TiltCard>
            </motion.div>
          );
        })}
      </motion.div>

      {/* Trade Modal */}
      <Dialog
        open={!!selectedCoin}
        onOpenChange={(open) => !open && setSelectedCoin(null)}
      >
        {selectedCoin && (
          <TradeModal
            coin={selectedCoin}
            mode={modalMode}
            userData={userData}
            onClose={() => setSelectedCoin(null)}
            addOrder={addOrder}
          />
        )}
      </Dialog>
    </div>
  );
}
