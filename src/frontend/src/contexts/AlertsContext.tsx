import type React from "react";
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
} from "react";
import { toast } from "sonner";

export type AlertDirection = "above" | "below";

export interface PriceAlert {
  id: string;
  coin: string;
  targetPrice: number;
  direction: AlertDirection;
  triggered: boolean;
  createdAt: Date;
}

interface AlertsContextType {
  alerts: PriceAlert[];
  addAlert: (
    coin: string,
    targetPrice: number,
    direction: AlertDirection,
  ) => void;
  removeAlert: (id: string) => void;
  checkAlerts: (prices: Record<string, { price: number }>) => void;
}

const AlertsContext = createContext<AlertsContextType | null>(null);

export function AlertsProvider({ children }: { children: React.ReactNode }) {
  const [alerts, setAlerts] = useState<PriceAlert[]>([
    {
      id: "demo-1",
      coin: "BTC",
      targetPrice: 70000,
      direction: "above",
      triggered: false,
      createdAt: new Date(Date.now() - 3600000),
    },
    {
      id: "demo-2",
      coin: "ETH",
      targetPrice: 3000,
      direction: "below",
      triggered: false,
      createdAt: new Date(Date.now() - 7200000),
    },
  ]);

  const triggeredRef = useRef<Set<string>>(new Set());

  const addAlert = useCallback(
    (coin: string, targetPrice: number, direction: AlertDirection) => {
      const id = `alert-${Date.now()}-${Math.random().toString(36).slice(2)}`;
      setAlerts((prev) => [
        ...prev,
        {
          id,
          coin,
          targetPrice,
          direction,
          triggered: false,
          createdAt: new Date(),
        },
      ]);
      toast.success(
        `Alert set: ${coin} ${direction} $${targetPrice.toLocaleString()}`,
        {
          description: "You'll be notified when the price is reached.",
        },
      );
    },
    [],
  );

  const removeAlert = useCallback((id: string) => {
    setAlerts((prev) => prev.filter((a) => a.id !== id));
    triggeredRef.current.delete(id);
  }, []);

  const checkAlerts = useCallback(
    (prices: Record<string, { price: number }>) => {
      setAlerts((prev) =>
        prev.map((alert) => {
          if (alert.triggered || triggeredRef.current.has(alert.id))
            return alert;
          const coinPrice = prices[alert.coin]?.price;
          if (!coinPrice) return alert;

          const triggered =
            (alert.direction === "above" && coinPrice >= alert.targetPrice) ||
            (alert.direction === "below" && coinPrice <= alert.targetPrice);

          if (triggered) {
            triggeredRef.current.add(alert.id);
            toast.success(`🚨 Alert Triggered: ${alert.coin}`, {
              description: `Price ${alert.direction === "above" ? "reached" : "dropped to"} $${coinPrice.toLocaleString()}. Target: $${alert.targetPrice.toLocaleString()}`,
            });
            return { ...alert, triggered: true };
          }
          return alert;
        }),
      );
    },
    [],
  );

  return (
    <AlertsContext.Provider
      value={{ alerts, addAlert, removeAlert, checkAlerts }}
    >
      {children}
    </AlertsContext.Provider>
  );
}

export function useAlerts() {
  const ctx = useContext(AlertsContext);
  if (!ctx) throw new Error("useAlerts must be used within AlertsProvider");
  return ctx;
}
