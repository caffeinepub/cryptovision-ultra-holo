import { cn } from "@/lib/utils";
import { useState } from "react";

const COIN_IMAGES: Record<string, string> = {
  BTC: "/assets/generated/coin-btc-transparent.dim_120x120.png",
  ETH: "/assets/generated/coin-eth-transparent.dim_120x120.png",
  SOL: "/assets/generated/coin-sol-transparent.dim_120x120.png",
  BNB: "/assets/generated/coin-bnb-transparent.dim_120x120.png",
  ADA: "/assets/generated/coin-ada-transparent.dim_120x120.png",
  DOGE: "/assets/generated/coin-doge-transparent.dim_120x120.png",
  XRP: "/assets/generated/coin-xrp-transparent.dim_120x120.png",
  MATIC: "/assets/generated/coin-matic-transparent.dim_120x120.png",
};

// Fallback colors for unknown coins
const FALLBACK_COLORS: Record<string, string> = {
  BTC: "#F7931A",
  ETH: "#627EEA",
  SOL: "#9945FF",
  BNB: "#F3BA2F",
  ADA: "#0033AD",
  DOGE: "#C2A633",
  XRP: "#346AA9",
  MATIC: "#8247E5",
};

interface CoinIconProps {
  symbol: string;
  size?: number;
  className?: string;
}

export default function CoinIcon({
  symbol,
  size = 32,
  className,
}: CoinIconProps) {
  const [imgError, setImgError] = useState(false);
  const imgSrc = COIN_IMAGES[symbol.toUpperCase()];
  const fallbackColor = FALLBACK_COLORS[symbol.toUpperCase()] ?? "#85b4c8";

  if (imgSrc && !imgError) {
    return (
      <img
        src={imgSrc}
        alt={`${symbol} logo`}
        width={size}
        height={size}
        onError={() => setImgError(true)}
        className={cn("object-contain", className)}
        style={{ width: size, height: size, minWidth: size, minHeight: size }}
        draggable={false}
      />
    );
  }

  // Fallback: colored circle with first letter
  return (
    <div
      className={cn(
        "flex items-center justify-center rounded-full font-bold",
        className,
      )}
      style={{
        width: size,
        height: size,
        minWidth: size,
        minHeight: size,
        background: `${fallbackColor}22`,
        border: `1.5px solid ${fallbackColor}66`,
        color: fallbackColor,
        fontSize: size * 0.4,
      }}
      aria-label={symbol}
    >
      {symbol.charAt(0)}
    </div>
  );
}
