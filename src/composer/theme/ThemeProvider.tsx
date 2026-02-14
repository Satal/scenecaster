import React, { createContext, useContext, type ReactNode } from "react";

export interface ThemeConfig {
  logo?: string;
  primaryColor: string;
  backgroundColor: string;
  textColor: string;
  fontFamily: string;
}

const ThemeContext = createContext<ThemeConfig>({
  primaryColor: "#1e40af",
  backgroundColor: "#0f172a",
  textColor: "#f8fafc",
  fontFamily: "Inter",
});

export function ThemeProvider({
  theme,
  children,
}: {
  theme: ThemeConfig;
  children: ReactNode;
}) {
  return (
    <ThemeContext.Provider value={theme}>{children}</ThemeContext.Provider>
  );
}

export function useTheme(): ThemeConfig {
  return useContext(ThemeContext);
}
