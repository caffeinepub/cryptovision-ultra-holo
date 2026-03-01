import { useQueryClient } from "@tanstack/react-query";
import { useCallback, useEffect, useRef, useState } from "react";
import { toast } from "sonner";
import { useActor } from "./useActor";
import type { CoinPrice } from "./usePrices";

export interface AutoSellOrder {
  id: string;
  coin: string;
  type: "stop-loss" | "take-profit";
  triggerPrice: number;
  quantity: number;
  createdAt: number;
}

const STORAGE_KEY = "cvuh_auto_orders";

function loadOrders(): AutoSellOrder[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    return JSON.parse(raw) as AutoSellOrder[];
  } catch {
    return [];
  }
}

function saveOrders(orders: AutoSellOrder[]) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(orders));
  } catch {
    // ignore
  }
}

export function useAutoSellOrders(prices: Record<string, CoinPrice>) {
  const [orders, setOrders] = useState<AutoSellOrder[]>(() => loadOrders());
  const { actor } = useActor();
  const queryClient = useQueryClient();
  const processingRef = useRef<Set<string>>(new Set());

  const addOrder = useCallback(
    (order: Omit<AutoSellOrder, "id" | "createdAt">) => {
      const newOrder: AutoSellOrder = {
        ...order,
        id: `${Date.now()}-${Math.random().toString(36).slice(2)}`,
        createdAt: Date.now(),
      };
      setOrders((prev) => {
        const updated = [...prev, newOrder];
        saveOrders(updated);
        return updated;
      });
      toast.success(
        `${order.type === "stop-loss" ? "Stop-loss" : "Take-profit"} set for ${order.coin}`,
        {
          description: `Triggers at ${new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" }).format(order.triggerPrice)}`,
        },
      );
    },
    [],
  );

  const cancelOrder = useCallback((id: string) => {
    setOrders((prev) => {
      const updated = prev.filter((o) => o.id !== id);
      saveOrders(updated);
      return updated;
    });
    toast.success("Auto-sell order cancelled");
  }, []);

  // Check orders on every price tick
  useEffect(() => {
    if (!actor || orders.length === 0) return;

    const toTrigger = orders.filter((order) => {
      if (processingRef.current.has(order.id)) return false;
      const price = prices[order.coin]?.price;
      if (!price) return false;
      if (order.type === "stop-loss") return price <= order.triggerPrice;
      if (order.type === "take-profit") return price >= order.triggerPrice;
      return false;
    });

    for (const order of toTrigger) {
      processingRef.current.add(order.id);
      actor
        .sell(order.coin, order.quantity)
        .then(() => {
          queryClient.invalidateQueries({ queryKey: ["userData"] });
          const label =
            order.type === "stop-loss" ? "Stop-loss" : "Take-profit";
          toast.success(
            `🤖 ${label} triggered for ${order.quantity.toFixed(4)} ${order.coin}`,
            {
              description: `Sold at ~$${prices[order.coin]?.price.toFixed(2) ?? "?"}`,
            },
          );
          setOrders((prev) => {
            const updated = prev.filter((o) => o.id !== order.id);
            saveOrders(updated);
            return updated;
          });
        })
        .catch(() => {
          processingRef.current.delete(order.id);
        });
    }
  }, [prices, orders, actor, queryClient]);

  return { orders, addOrder, cancelOrder };
}
