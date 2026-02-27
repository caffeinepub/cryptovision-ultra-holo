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
  ShoppingCart,
  TrendingDown,
  TrendingUp,
} from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { useState } from "react";
import { toast } from "sonner";
import type { UserDataView } from "../../backend.d";
import type { CoinPrice } from "../../hooks/usePrices";
import { useBuy, useSell } from "../../hooks/useQueries";
import type { Page } from "../../types/navigation";
import CoinIcon from "../CoinIcon";

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

function TradeModal({
  coin,
  mode,
  userData,
  onClose,
}: {
  coin: CoinPrice;
  mode: ModalMode;
  userData?: UserDataView;
  onClose: () => void;
}) {
  const [amount, setAmount] = useState("");
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
      }
      onClose();
    } catch {
      toast.error("Trade failed. Please try again.");
    }
  };

  const isBuy = mode === "buy";
  const val = Number.parseFloat(amount) || 0;
  const estimatedQty = isBuy ? val / coin.price : val;
  const estimatedValue = isBuy ? val : val * coin.price;

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
              <span className="text-muted-foreground">
                {isBuy ? "You'll receive" : "You'll receive"}
              </span>
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

        <div className="flex gap-3 pt-1">
          <Button
            variant="outline"
            onClick={onClose}
            className="flex-1 border-muted hover:bg-muted/30"
          >
            Cancel
          </Button>
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
        </div>
      </div>
    </DialogContent>
  );
}

const container = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { staggerChildren: 0.05 } },
};

const itemVariant = {
  hidden: { opacity: 0, x: -10 },
  show: { opacity: 1, x: 0, transition: { duration: 0.3 } },
};

export default function Trade({ priceList, userData }: TradeProps) {
  const [selectedCoin, setSelectedCoin] = useState<CoinPrice | null>(null);
  const [modalMode, setModalMode] = useState<ModalMode>("buy");
  const [search, setSearch] = useState("");

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
        variants={container}
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
            <motion.div
              key={coin.symbol}
              variants={itemVariant}
              className="glass-card p-4 space-y-3 hover:border-primary/30 transition-all group cursor-default"
            >
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
          />
        )}
      </Dialog>
    </div>
  );
}
