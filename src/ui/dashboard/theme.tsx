import React from "react";
import { createDashboardTokens, dashboardShadows } from "@/ui/dashboard/tokens";
import type { DashboardTokens } from "@/ui/dashboard/tokens";

type DashboardTheme = {
  tokens: DashboardTokens;
  shadows: typeof dashboardShadows;
};

const DashboardThemeContext = React.createContext<DashboardTheme>({
  tokens: createDashboardTokens(true),
  shadows: dashboardShadows,
});

export function DashboardThemeProvider({
  isDark,
  children,
}: {
  isDark: boolean;
  children: React.ReactNode;
}): JSX.Element {
  const tokens = createDashboardTokens(isDark);
  return (
    <DashboardThemeContext.Provider value={{ tokens, shadows: dashboardShadows }}>
      {children}
    </DashboardThemeContext.Provider>
  );
}

export function useDashboardTheme(): DashboardTheme {
  return React.useContext(DashboardThemeContext);
}
