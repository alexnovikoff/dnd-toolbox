// palette.js — neutral theme palettes, accent options, and the live palette builder.
// Ported verbatim from design-reference/parts.jsx. In production the resulting
// values are written to CSS variables by ThemeProvider (see theme.jsx); the
// resolved object is still exposed via useTheme().palette for the few consumers
// that need raw color strings (e.g. <canvas> fills, accent swatches).

export const PALETTES = {
  obsidian: {
    name: 'Obsidian & Gold',
    tag: 'Тёмное фэнтези · основное',
    bg: '#0f0d0a',
    panel: '#171310',
    raised: '#211a13',
    line: 'rgba(201,168,76,.18)',
    line2: 'rgba(236,227,208,.07)',
    text: '#ece3d0',
    muted: '#9a8e77',
    faint: '#6b6253',
    gold: '#c9a84c',
    goldBright: '#e6cd84',
    glow: 'rgba(201,168,76,.14)',
    onAccent: '#15110b',
    swatches: ['#0f0d0a', '#211a13', '#9a8e77', '#c9a84c', '#e6cd84'],
  },
  vellum: {
    name: 'Vellum',
    tag: 'Пергамент · светлая',
    bg: '#ece3cf',
    panel: '#f6efde',
    raised: '#fdf8ec',
    line: 'rgba(120,90,40,.22)',
    line2: 'rgba(60,45,20,.08)',
    text: '#2c2318',
    muted: '#6f6250',
    faint: '#9c8e76',
    gold: '#9a7421',
    goldBright: '#b8902f',
    glow: 'rgba(154,116,33,.12)',
    onAccent: '#fff8ec',
    swatches: ['#ece3cf', '#fdf8ec', '#9c8e76', '#9a7421', '#2c2318'],
  },
};

// Accent options + the per-theme hex for each.
export const ACCENTS = [
  { id: 'gold', name: 'Золото', dark: '#c9a84c', light: '#9a7421' },
  { id: 'crimson', name: 'Багрянец', dark: '#d06a52', light: '#b3402a' },
  { id: 'teal', name: 'Бирюза', dark: '#45a3b3', light: '#1f7d8c' },
  { id: 'violet', name: 'Аметист', dark: '#9b80d8', light: '#6b4fb0' },
  { id: 'emerald', name: 'Изумруд', dark: '#4fb487', light: '#2a7d56' },
  { id: 'copper', name: 'Медь', dark: '#c98a4f', light: '#9c5f24' },
];

export function hexToRgb(hex) {
  const h = hex.replace('#', '');
  return [parseInt(h.slice(0, 2), 16), parseInt(h.slice(2, 4), 16), parseInt(h.slice(4, 6), 16)];
}

export function rgba(hex, a) {
  const [r, g, b] = hexToRgb(hex);
  return `rgba(${r},${g},${b},${a})`;
}

export function lighten(hex, amt) {
  const [r, g, b] = hexToRgb(hex);
  const f = (c) => Math.round(c + (255 - c) * amt);
  return (
    '#' +
    [f(r), f(g), f(b)].map((x) => x.toString(16).padStart(2, '0')).join('')
  );
}

// Build an effective palette from theme ('dark'|'light') + accent id.
// Dark base = Obsidian, light base = Vellum. The accent recolors the
// interactive chrome (gold/glow/line) while neutrals stay from the base.
export function makePalette(theme, accentId) {
  const light = theme === 'light';
  const base = { ...(light ? PALETTES.vellum : PALETTES.obsidian) };
  const a = ACCENTS.find((x) => x.id === accentId) || ACCENTS[0];
  const acc = light ? a.light : a.dark;
  base.gold = acc;
  base.goldBright = lighten(acc, light ? 0.14 : 0.28);
  base.glow = rgba(acc, light ? 0.13 : 0.16);
  base.line = rgba(acc, light ? 0.34 : 0.26);
  base.onAccent = light ? '#fff8ec' : '#14100a';
  base.theme = theme;
  base.accentId = accentId;
  return base;
}
