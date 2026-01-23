import React, { createContext, useCallback, useContext, useEffect, useState } from "react";
import { getPreference, setPreference } from "@/repositories/preferencesRepo";

const SHOW_INVESTMENTS_KEY = "settings.showInvestments";
const DEFAULT_SHOW_INVESTMENTS = true;

type SettingsContextValue = {
  showInvestments: boolean;
  setShowInvestments: (next: boolean) => Promise<void>;
};

const SettingsContext = createContext<SettingsContextValue | null>(null);

type SettingsProviderProps = {
  children: React.ReactNode;
};

export function SettingsProvider({ children }: SettingsProviderProps): JSX.Element {
  const [showInvestments, setShowInvestmentsState] = useState(DEFAULT_SHOW_INVESTMENTS);

  useEffect(() => {
    let active = true;
    (async () => {
      const pref = await getPreference(SHOW_INVESTMENTS_KEY);
      if (!active) return;
      const value = pref ? pref.value === "true" : DEFAULT_SHOW_INVESTMENTS;
      setShowInvestmentsState(value);
    })();
    return () => {
      active = false;
    };
  }, []);

  const setShowInvestments = useCallback(async (next: boolean) => {
    await setPreference(SHOW_INVESTMENTS_KEY, next ? "true" : "false");
    setShowInvestmentsState(next);
  }, []);

  return (
    <SettingsContext.Provider value={{ showInvestments, setShowInvestments }}>
      {children}
    </SettingsContext.Provider>
  );
}

export function useSettings(): SettingsContextValue {
  const context = useContext(SettingsContext);
  if (!context) {
    throw new Error("useSettings must be used within a SettingsProvider");
  }
  return context;
}
