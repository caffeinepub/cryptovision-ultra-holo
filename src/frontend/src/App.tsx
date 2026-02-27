import { Toaster } from "@/components/ui/sonner";
import { AnimatePresence, motion } from "motion/react";
import { useState } from "react";
import MainLayout from "./components/MainLayout";
import HomePage from "./components/pages/HomePage";
import { AlertsProvider } from "./contexts/AlertsContext";
import { MarketProvider } from "./contexts/MarketContext";

export default function App() {
  const [showHome, setShowHome] = useState(true);

  return (
    <>
      <AnimatePresence mode="wait">
        {showHome ? (
          <motion.div
            key="home"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0, scale: 0.98 }}
            transition={{ duration: 0.4 }}
          >
            <HomePage onLaunch={() => setShowHome(false)} />
          </motion.div>
        ) : (
          <motion.div
            key="app"
            initial={{ opacity: 0, scale: 1.02 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.4 }}
          >
            <MarketProvider>
              <AlertsProvider>
                <MainLayout />
              </AlertsProvider>
            </MarketProvider>
          </motion.div>
        )}
      </AnimatePresence>
      <Toaster
        theme="dark"
        position="top-right"
        toastOptions={{
          style: {
            background: "oklch(0.12 0.025 265 / 0.9)",
            backdropFilter: "blur(20px)",
            border: "1px solid oklch(0.85 0.18 195 / 0.3)",
            color: "oklch(0.95 0.04 200)",
          },
        }}
      />
    </>
  );
}
