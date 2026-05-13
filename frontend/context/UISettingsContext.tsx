"use client";

import React, { createContext, useContext, useEffect, useState } from "react";

interface UISettingsContextType {
  isSidebarCompact: boolean;
  setSidebarCompact: (compact: boolean) => void;
  toggleSidebarCompact: () => void;
}

const UISettingsContext = createContext<UISettingsContextType | undefined>(undefined);

export function UISettingsProvider({ children }: { children: React.ReactNode }) {
  const [isSidebarCompact, setIsSidebarCompact] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    const saved = localStorage.getItem("sidebar-compact");
    if (saved) {
      setIsSidebarCompact(saved === "true");
    }
    setMounted(true);
  }, []);

  useEffect(() => {
    if (mounted) {
      const width = isSidebarCompact ? "80px" : "256px";
      document.documentElement.style.setProperty("--sidebar-width", width);
    }
  }, [isSidebarCompact, mounted]);

  const setSidebarCompact = (compact: boolean) => {
    setIsSidebarCompact(compact);
    localStorage.setItem("sidebar-compact", String(compact));
  };

  const toggleSidebarCompact = () => {
    setSidebarCompact(!isSidebarCompact);
  };

  return (
    <UISettingsContext.Provider
      value={{
        isSidebarCompact,
        setSidebarCompact,
        toggleSidebarCompact,
      }}
    >
      {children}
    </UISettingsContext.Provider>
  );
}

export function useUISettings() {
  const context = useContext(UISettingsContext);
  if (context === undefined) {
    throw new Error("useUISettings must be used within a UISettingsProvider");
  }
  return context;
}
