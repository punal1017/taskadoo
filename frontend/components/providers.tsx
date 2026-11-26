"use client";

import { Suspense, createContext, useContext, useEffect, useMemo, useState } from "react";
import { AppRouterCacheProvider } from "@mui/material-nextjs/v16-appRouter";
import { CssBaseline, ThemeProvider, createTheme } from "@mui/material";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import type { ReactNode } from "react";
import type { AuthResult, User } from "@/types/models";
import AppShell from "@/components/app-shell";

interface AuthContextValue {
  user: User | null;
  ready: boolean;
  signIn: (result: AuthResult, remember: boolean) => void;
  signOut: () => void;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useAuth must be used within Providers");
  return context;
};

const theme = createTheme({
  palette: {
    mode: "light",
    primary: { main: "#4F6BED", dark: "#4059D6", light: "#EEF1FF" },
    background: { default: "#F6F7FB", paper: "#FFFFFF" },
    text: { primary: "#202433", secondary: "#737B8C" },
    divider: "#E8EAF0",
    success: { main: "#269B73" },
    warning: { main: "#D99A35" },
    error: { main: "#D75B63" },
    info: { main: "#5385D8" },
  },
  shape: { borderRadius: 12 },
  typography: {
    fontFamily: 'Inter, "Segoe UI", Arial, sans-serif',
    h1: { fontSize: "1.75rem", fontWeight: 700, letterSpacing: "-0.03em" },
    h2: { fontSize: "1.5rem", fontWeight: 700, letterSpacing: "-0.025em" },
    h3: { fontSize: "1.125rem", fontWeight: 650 },
    h4: { fontSize: "1rem", fontWeight: 650 },
    button: { textTransform: "none", fontWeight: 600 },
    body2: { lineHeight: 1.55 },
  },
  components: {
    MuiButton: {
      styleOverrides: {
        root: { borderRadius: 10, minHeight: 40, boxShadow: "none" },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          border: "1px solid #E8EAF0",
          borderRadius: 16,
          boxShadow: "0 2px 8px rgba(32, 37, 50, 0.025)",
        },
      },
    },
    MuiOutlinedInput: {
      styleOverrides: {
        root: { borderRadius: 11 },
        notchedOutline: { borderColor: "#E8EAF0" },
      },
    },
    MuiDialog: {
      styleOverrides: { paper: { borderRadius: 18 } },
    },
  },
});

export default function Providers({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    try {
      const savedUser =
        window.localStorage.getItem("taskadoo-user") ??
        window.sessionStorage.getItem("taskadoo-user");
      const token =
        window.localStorage.getItem("taskadoo-token") ??
        window.sessionStorage.getItem("taskadoo-token");
      if (savedUser && token) setUser(JSON.parse(savedUser) as User);
      if (!token) {
        window.localStorage.removeItem("taskadoo-user");
        window.sessionStorage.removeItem("taskadoo-user");
      }
    } finally {
      setReady(true);
    }
  }, []);

  const value = useMemo<AuthContextValue>(
    () => ({
      user,
      ready,
      signIn: (result, remember) => {
        const storage = remember ? window.localStorage : window.sessionStorage;
        const otherStorage = remember ? window.sessionStorage : window.localStorage;
        storage.setItem("taskadoo-token", result.token);
        storage.setItem("taskadoo-user", JSON.stringify(result.user));
        otherStorage.removeItem("taskadoo-token");
        otherStorage.removeItem("taskadoo-user");
        setUser(result.user);
      },
      signOut: () => {
        window.localStorage.removeItem("taskadoo-token");
        window.localStorage.removeItem("taskadoo-user");
        window.sessionStorage.removeItem("taskadoo-token");
        window.sessionStorage.removeItem("taskadoo-user");
        setUser(null);
      },
    }),
    [ready, user],
  );

  return (
    <AppRouterCacheProvider>
      <ThemeProvider theme={theme}>
        <CssBaseline />
        <LocalizationProvider dateAdapter={AdapterDayjs}>
          <AuthContext.Provider value={value}>
            <Suspense fallback={null}>
              <AppShell>{children}</AppShell>
            </Suspense>
          </AuthContext.Provider>
        </LocalizationProvider>
      </ThemeProvider>
    </AppRouterCacheProvider>
  );
}
