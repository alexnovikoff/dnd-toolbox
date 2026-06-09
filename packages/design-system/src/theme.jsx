// theme.jsx — ThemeProvider + useTheme.
// Holds theme ('dark'|'light') and accent id; writes the design tokens as CSS
// variables on <html>; persists both to localStorage (ddtb_theme, ddtb_accent).
import {
  createContext,
  useContext,
  useState,
  useEffect,
  useMemo,
  useCallback,
} from 'react';
import { makePalette, ACCENTS } from './palette.js';

const ThemeCtx = createContext(null);

const THEME_KEY = 'ddtb_theme';
const ACCENT_KEY = 'ddtb_accent';

function lsGet(key, fallback) {
  try {
    return localStorage.getItem(key) || fallback;
  } catch {
    return fallback;
  }
}
function lsSet(key, value) {
  try {
    localStorage.setItem(key, value);
  } catch {
    /* ignore (private mode / SSR) */
  }
}

// Map the resolved palette object onto the --ds-* custom properties.
function applyVars(palette) {
  if (typeof document === 'undefined') return;
  const root = document.documentElement;
  root.setAttribute('data-theme', palette.theme);
  const vars = {
    '--ds-bg': palette.bg,
    '--ds-panel': palette.panel,
    '--ds-raised': palette.raised,
    '--ds-text': palette.text,
    '--ds-muted': palette.muted,
    '--ds-faint': palette.faint,
    '--ds-line': palette.line,
    '--ds-line2': palette.line2,
    '--ds-accent': palette.gold,
    '--ds-accent-bright': palette.goldBright,
    '--ds-glow': palette.glow,
    '--ds-on-accent': palette.onAccent,
  };
  for (const [k, v] of Object.entries(vars)) root.style.setProperty(k, v);
}

export function ThemeProvider({ children, defaultTheme = 'dark', defaultAccent = 'gold' }) {
  const [theme, setTheme] = useState(() => lsGet(THEME_KEY, defaultTheme));
  const [accent, setAccent] = useState(() => lsGet(ACCENT_KEY, defaultAccent));

  const palette = useMemo(() => makePalette(theme, accent), [theme, accent]);

  useEffect(() => {
    applyVars(palette);
  }, [palette]);
  useEffect(() => {
    lsSet(THEME_KEY, theme);
  }, [theme]);
  useEffect(() => {
    lsSet(ACCENT_KEY, accent);
  }, [accent]);
  useEffect(() => {
    if (typeof document !== 'undefined') document.body.style.background = palette.bg;
  }, [palette.bg]);

  const toggleTheme = useCallback(
    () => setTheme((t) => (t === 'dark' ? 'light' : 'dark')),
    []
  );

  const value = useMemo(
    () => ({ theme, accent, palette, accents: ACCENTS, setTheme, setAccent, toggleTheme }),
    [theme, accent, palette, toggleTheme]
  );

  return <ThemeCtx.Provider value={value}>{children}</ThemeCtx.Provider>;
}

export function useTheme() {
  const ctx = useContext(ThemeCtx);
  if (!ctx) throw new Error('useTheme must be used within a <ThemeProvider>.');
  return ctx;
}
