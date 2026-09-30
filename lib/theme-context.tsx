"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react";

export type ThemeMode = "pro" | "terminal" | "paper";

const VALID_MODES: readonly ThemeMode[] = ["pro", "terminal", "paper"];
const STORAGE_KEY = "portfolio-mode";
const QUERY_PARAM = "mode";

function isThemeMode(value: string | null | undefined): value is ThemeMode {
  return value != null && (VALID_MODES as readonly string[]).includes(value);
}

interface ThemeModeContextValue {
  mode: ThemeMode;
  setMode: (mode: ThemeMode) => void;
}

const ThemeModeContext = createContext<ThemeModeContextValue | undefined>(undefined);

export function ThemeModeProvider({ children }: { children: ReactNode }) {
  // Server render (and the pre-hydration client paint) always starts on the
  // default. The real initial mode — which depends on the URL and
  // localStorage, both client-only — is resolved in the effect below.
  const [mode, setModeState] = useState<ThemeMode>("pro");

  useEffect(() => {
    try {
      const params = new URLSearchParams(window.location.search);
      const fromUrl = params.get(QUERY_PARAM);
      if (isThemeMode(fromUrl)) {
        // Resolving a client-only initial value (URL/localStorage unavailable
        // during SSR prerender) — the standard hydration-safe pattern.
        // eslint-disable-next-line react-hooks/set-state-in-effect
        setModeState(fromUrl);
        return;
      }
    } catch {
      // URL/search params unavailable for some reason — fall through.
    }

    try {
      const fromStorage = window.localStorage.getItem(STORAGE_KEY);
      if (isThemeMode(fromStorage)) {
        setModeState(fromStorage);
      }
    } catch {
      // localStorage can throw in private browsing / storage-disabled
      // contexts. Silently keep the default mode.
    }
  }, []);

  const setMode = useCallback((next: ThemeMode) => {
    setModeState(next);

    try {
      window.localStorage.setItem(STORAGE_KEY, next);
    } catch {
      // Storage unavailable — the mode still applies for this page view,
      // it just won't be remembered next visit.
    }

    try {
      const url = new URL(window.location.href);
      url.searchParams.set(QUERY_PARAM, next);
      window.history.replaceState(window.history.state, "", url.toString());
    } catch {
      // No-op outside a browser (or a restricted environment) — nothing to
      // sync the URL against.
    }
  }, []);

  return (
    <ThemeModeContext.Provider value={{ mode, setMode }}>{children}</ThemeModeContext.Provider>
  );
}

export function useThemeMode(): ThemeModeContextValue {
  const ctx = useContext(ThemeModeContext);
  if (!ctx) {
    throw new Error("useThemeMode must be used within a ThemeModeProvider");
  }
  return ctx;
}
