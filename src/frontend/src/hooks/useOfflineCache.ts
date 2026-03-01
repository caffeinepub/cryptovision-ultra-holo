import type { UserDataView } from "../backend.d";

const CACHE_KEY = "cvuh_progress";

export function useOfflineCache() {
  const cachedData = (): UserDataView | undefined => {
    try {
      const raw = localStorage.getItem(CACHE_KEY);
      if (!raw) return undefined;
      const parsed = JSON.parse(raw) as UserDataView;
      // Ensure bigint fields are handled: xp is stored as string from JSON
      if (typeof (parsed as { xp: unknown }).xp === "string") {
        parsed.xp = BigInt(parsed.xp as unknown as string);
      } else if (typeof (parsed as { xp: unknown }).xp === "number") {
        parsed.xp = BigInt(Math.round(parsed.xp as unknown as number));
      }
      // Restore BigInt timestamps in tradeHistory
      if (Array.isArray(parsed.tradeHistory)) {
        parsed.tradeHistory = parsed.tradeHistory.map((t) => ({
          ...t,
          timestamp:
            typeof t.timestamp === "string"
              ? BigInt(t.timestamp)
              : typeof t.timestamp === "number"
                ? BigInt(Math.round(t.timestamp))
                : t.timestamp,
        }));
      }
      return parsed;
    } catch {
      return undefined;
    }
  };

  const saveToCache = (data: UserDataView) => {
    try {
      // JSON can't serialize BigInt, so we convert to string
      const serializable = {
        ...data,
        xp: data.xp.toString(),
        tradeHistory: data.tradeHistory.map((t) => ({
          ...t,
          timestamp: t.timestamp.toString(),
        })),
      };
      localStorage.setItem(CACHE_KEY, JSON.stringify(serializable));
    } catch {
      // Ignore storage errors (e.g., private browsing)
    }
  };

  const clearCache = () => {
    try {
      localStorage.removeItem(CACHE_KEY);
    } catch {
      // Ignore
    }
  };

  return { cachedData, saveToCache, clearCache };
}
