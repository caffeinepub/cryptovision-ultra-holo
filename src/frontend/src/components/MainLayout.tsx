import { cn } from "@/lib/utils";
import {
  BarChart3,
  Bell,
  BookOpen,
  Bot,
  LayoutDashboard,
  Menu,
  Settings,
  TrendingUp,
  Trophy,
  Wallet,
  X,
  Zap,
} from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { useEffect, useState } from "react";
import { useAlerts } from "../contexts/AlertsContext";
import { useMarketContext } from "../contexts/MarketContext";
import { usePrices } from "../hooks/usePrices";
import { useUserData } from "../hooks/useQueries";

import type { Page } from "../types/navigation";
import Academy from "./pages/Academy";
import AiTutor from "./pages/AiTutor";
import Alerts from "./pages/Alerts";
import Charts from "./pages/Charts";
import Dashboard from "./pages/Dashboard";
import Gamification from "./pages/Gamification";
import Portfolio from "./pages/Portfolio";
import SettingsPage from "./pages/SettingsPage";
import Trade from "./pages/Trade";

const NAV_ITEMS: { id: Page; label: string; icon: typeof LayoutDashboard }[] = [
  { id: "dashboard", label: "Dashboard", icon: LayoutDashboard },
  { id: "trade", label: "Trade", icon: TrendingUp },
  { id: "portfolio", label: "Portfolio", icon: Wallet },
  { id: "charts", label: "Charts", icon: BarChart3 },
  { id: "alerts", label: "Alerts", icon: Bell },
  { id: "gamification", label: "Gamify", icon: Trophy },
  { id: "academy", label: "Academy", icon: BookOpen },
  { id: "aiTutor", label: "AI Tutor", icon: Bot },
  { id: "settings", label: "Settings", icon: Settings },
];

export default function MainLayout() {
  const [activePage, setActivePage] = useState<Page>("dashboard");
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { marketMode } = useMarketContext();
  const { prices, priceList } = usePrices(marketMode);
  const { checkAlerts } = useAlerts();
  const { data: userData } = useUserData();

  // Check alerts whenever prices update
  useEffect(() => {
    checkAlerts(prices);
  }, [prices, checkAlerts]);

  const ActivePage = {
    dashboard: Dashboard,
    trade: Trade,
    portfolio: Portfolio,
    charts: Charts,
    alerts: Alerts,
    gamification: Gamification,
    academy: Academy,
    aiTutor: AiTutor,
    settings: SettingsPage,
  }[activePage];

  return (
    <div className="flex min-h-screen">
      {/* Desktop Sidebar */}
      <aside className="hidden lg:flex flex-col w-64 fixed left-0 top-0 bottom-0 z-40 glass-card rounded-none border-r border-r-[oklch(0.85_0.18_195_/_0.2)] border-t-0 border-b-0 border-l-0">
        {/* Logo */}
        <div className="p-6 border-b border-[oklch(0.85_0.18_195_/_0.15)]">
          <div className="flex items-center gap-3">
            <div className="relative w-10 h-10 flex items-center justify-center">
              <div className="absolute inset-0 rounded-full bg-primary/20 animate-pulse-neon" />
              <Zap className="w-6 h-6 text-primary relative z-10" />
            </div>
            <div>
              <div className="font-display font-bold text-sm gradient-text-holo">
                CryptoVision
              </div>
              <div className="font-mono text-xs text-muted-foreground tracking-widest">
                ULTRA HOLO
              </div>
            </div>
          </div>
        </div>

        {/* Nav items */}
        <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
          {NAV_ITEMS.map((item) => {
            const Icon = item.icon;
            const isActive = activePage === item.id;
            return (
              <button
                type="button"
                key={item.id}
                onClick={() => setActivePage(item.id)}
                className={cn(
                  "w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-all duration-200",
                  isActive
                    ? "nav-active text-primary"
                    : "text-muted-foreground hover:text-foreground hover:bg-muted/50",
                )}
              >
                <Icon
                  className={cn(
                    "w-5 h-5 flex-shrink-0",
                    isActive && "text-primary",
                  )}
                />
                <span>{item.label}</span>
                {isActive && (
                  <motion.div
                    layoutId="activeIndicator"
                    className="ml-auto w-1.5 h-1.5 rounded-full bg-primary"
                    initial={false}
                    transition={{ type: "spring", stiffness: 400, damping: 30 }}
                  />
                )}
              </button>
            );
          })}
        </nav>

        {/* Market mode indicator */}
        <div className="p-4 border-t border-[oklch(0.85_0.18_195_/_0.15)]">
          <div className="glass-card p-3">
            <div className="text-xs text-muted-foreground mb-1">
              Market Mode
            </div>
            <div
              className={cn(
                "text-sm font-mono font-bold uppercase tracking-wider",
                marketMode === "bull" && "neon-green",
                marketMode === "bear" && "neon-pink",
                marketMode === "normal" && "neon-cyan",
              )}
            >
              {marketMode === "bull" && "⬆ BULL RUN"}
              {marketMode === "bear" && "⬇ BEAR MARKET"}
              {marketMode === "normal" && "◈ NORMAL"}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 text-center">
          <p className="text-xs text-muted-foreground">
            © {new Date().getFullYear()}.{" "}
            <a
              href={`https://caffeine.ai?utm_source=caffeine-footer&utm_medium=referral&utm_content=${encodeURIComponent(window.location.hostname)}`}
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-primary transition-colors"
            >
              Built with ❤ using caffeine.ai
            </a>
          </p>
        </div>
      </aside>

      {/* Mobile Header */}
      <header className="lg:hidden fixed top-0 left-0 right-0 z-50 glass-card rounded-none border-b border-[oklch(0.85_0.18_195_/_0.2)] border-t-0 border-l-0 border-r-0">
        <div className="flex items-center justify-between px-4 py-3">
          <div className="flex items-center gap-2">
            <Zap className="w-5 h-5 text-primary" />
            <span className="font-display font-bold text-sm gradient-text-holo">
              CryptoVision
            </span>
          </div>
          <button
            type="button"
            onClick={() => setSidebarOpen(true)}
            className="p-2 rounded-lg hover:bg-muted/50 transition-colors"
          >
            <Menu className="w-5 h-5 text-foreground" />
          </button>
        </div>
      </header>

      {/* Mobile Sidebar Overlay */}
      <AnimatePresence>
        {sidebarOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setSidebarOpen(false)}
              className="lg:hidden fixed inset-0 z-50 bg-black/60 backdrop-blur-sm"
            />
            <motion.aside
              initial={{ x: "-100%" }}
              animate={{ x: 0 }}
              exit={{ x: "-100%" }}
              transition={{ type: "spring", stiffness: 300, damping: 30 }}
              className="lg:hidden fixed left-0 top-0 bottom-0 w-72 z-50 glass-card rounded-none border-r border-[oklch(0.85_0.18_195_/_0.2)]"
            >
              <div className="p-4 border-b border-[oklch(0.85_0.18_195_/_0.15)] flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Zap className="w-5 h-5 text-primary" />
                  <span className="font-display font-bold gradient-text-holo">
                    CryptoVision
                  </span>
                </div>
                <button
                  type="button"
                  onClick={() => setSidebarOpen(false)}
                  className="p-1.5 hover:bg-muted/50 rounded-lg"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
              <nav className="p-4 space-y-1">
                {NAV_ITEMS.map((item) => {
                  const Icon = item.icon;
                  const isActive = activePage === item.id;
                  return (
                    <button
                      type="button"
                      key={item.id}
                      onClick={() => {
                        setActivePage(item.id);
                        setSidebarOpen(false);
                      }}
                      className={cn(
                        "w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-all",
                        isActive
                          ? "nav-active text-primary"
                          : "text-muted-foreground hover:text-foreground hover:bg-muted/50",
                      )}
                    >
                      <Icon className="w-5 h-5" />
                      {item.label}
                    </button>
                  );
                })}
              </nav>
            </motion.aside>
          </>
        )}
      </AnimatePresence>

      {/* Mobile Bottom Nav */}
      <nav className="lg:hidden fixed bottom-0 left-0 right-0 z-40 glass-card rounded-none border-t border-[oklch(0.85_0.18_195_/_0.2)] border-b-0 border-l-0 border-r-0">
        <div className="flex items-center justify-around py-2 px-2">
          {[
            ...NAV_ITEMS.slice(0, 4),
            NAV_ITEMS.find((n) => n.id === "aiTutor")!,
          ].map((item) => {
            const Icon = item.icon;
            const isActive = activePage === item.id;
            return (
              <button
                type="button"
                key={item.id}
                onClick={() => setActivePage(item.id)}
                className={cn(
                  "flex flex-col items-center gap-0.5 px-3 py-2 rounded-lg transition-all",
                  isActive ? "text-primary" : "text-muted-foreground",
                )}
              >
                <Icon className="w-5 h-5" />
                <span className="text-[10px]">{item.label}</span>
              </button>
            );
          })}
        </div>
      </nav>

      {/* Main Content */}
      <main className="flex-1 lg:ml-64 pt-16 lg:pt-0 pb-20 lg:pb-0 min-h-screen">
        <div className="h-full p-4 lg:p-6">
          <AnimatePresence mode="wait">
            <motion.div
              key={activePage}
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.25, ease: "easeOut" }}
              className="h-full"
            >
              <ActivePage
                prices={prices}
                priceList={priceList}
                userData={userData}
                onNavigate={setActivePage}
              />
            </motion.div>
          </AnimatePresence>
        </div>
      </main>
    </div>
  );
}
