// icons.jsx — clean line-icon set for the D&D Toolbox.
// 24x24 grid, stroke=currentColor, no fills, stroke-width 1.6 (DESIGN_SYSTEM.md §7).
// Paths ported verbatim from design-reference/icons.jsx. New modules add their
// icon here.
export const ICON_PATHS = {
  // tools
  character: (
    <g>
      <path d="M12 3.2c2 0 3.2 1.6 3.2 3.6S14 11 12 11 8.8 8.8 8.8 6.8 10 3.2 12 3.2Z" />
      <path d="M5.5 20.5c0-3.8 2.9-6.4 6.5-6.4s6.5 2.6 6.5 6.4" />
      <path d="M12 3.2 13.4 6l-1.4-.7L10.6 6Z" />
    </g>
  ),
  token: (
    <g>
      <circle cx="12" cy="12" r="8.4" />
      <circle cx="12" cy="12" r="4.6" />
      <circle cx="12" cy="12" r="1.1" fill="currentColor" stroke="none" />
      <path d="M12 1.4V4M12 20v2.6M1.4 12H4M20 12h2.6" />
    </g>
  ),
  npc: (
    <g>
      <circle cx="9" cy="8" r="2.8" />
      <path d="M3.6 19.5c0-3 2.4-5 5.4-5s5.4 2 5.4 5" />
      <path d="M15.4 6.2a2.8 2.8 0 0 1 0 5.4" />
      <path d="M16.2 14.8c2.5.4 4.2 2.3 4.2 4.7" />
    </g>
  ),
  loot: (
    <g>
      <rect x="3.5" y="8.5" width="17" height="11" rx="1.6" />
      <path d="M3.5 12.5h17" />
      <path d="M3.5 8.5 6 5h12l2.5 3.5" />
      <rect x="10.4" y="11" width="3.2" height="3" rx="0.6" />
    </g>
  ),
  tavern: (
    <g>
      <path d="M6 7h9v10a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2Z" />
      <path d="M15 9h2.6a2 2 0 0 1 2 2v1.4a2 2 0 0 1-2 2H15" />
      <path d="M8.5 4.4c.7.7.4 1.5 0 2.2M11.5 4.4c.7.7.4 1.5 0 2.2" />
    </g>
  ),
  city: (
    <g>
      <path d="M3 20.5h18" />
      <path d="M5 20.5V11l4-2.6V20.5" />
      <path d="M9 20.5V6l5-2.6V20.5" />
      <path d="M14 20.5V10l5 2.4v8.1" />
      <path d="M16.4 14.6v.01M16.4 17.4v.01M11 8.5v.01M11 11.4v.01M11 14.3v.01" />
    </g>
  ),
  dice: (
    <g>
      <path d="M12 2.5 20.5 7v10L12 21.5 3.5 17V7Z" />
      <path d="M12 2.5 12 9M12 9 4 6.4M12 9l8-2.6M12 9v12.5" />
      <circle cx="12" cy="13.5" r="1.1" fill="currentColor" stroke="none" />
    </g>
  ),
  // ui
  gear: (
    <g>
      <circle cx="12" cy="12" r="3.2" />
      <path d="M12 2.6v2.4M12 19v2.4M21.4 12H19M5 12H2.6M18.6 5.4 16.9 7.1M7.1 16.9l-1.7 1.7M18.6 18.6 16.9 16.9M7.1 7.1 5.4 5.4" />
    </g>
  ),
  search: (
    <g>
      <circle cx="11" cy="11" r="6.4" />
      <path d="m20 20-3.8-3.8" />
    </g>
  ),
  plus: <path d="M12 5v14M5 12h14" />,
  grid: (
    <g>
      <rect x="4" y="4" width="6.4" height="6.4" rx="1.2" />
      <rect x="13.6" y="4" width="6.4" height="6.4" rx="1.2" />
      <rect x="4" y="13.6" width="6.4" height="6.4" rx="1.2" />
      <rect x="13.6" y="13.6" width="6.4" height="6.4" rx="1.2" />
    </g>
  ),
  chevron: <path d="m9 6 6 6-6 6" />,
  wand: (
    <g>
      <path d="M5 19 16 8" />
      <path d="M17.5 3.5 18 5.3l1.8.5-1.8.5-.5 1.8-.5-1.8L15.2 6l1.8-.5Z" />
      <path d="M6.5 4.5 7 6l1.5.5L7 7l-.5 1.5L6 7l-1.5-.5L6 6Z" />
      <path d="M19.5 13.5 20 15l1.5.5L20 16l-.5 1.5L19 16l-1.5-.5L19 15Z" />
    </g>
  ),
  book: (
    <g>
      <path d="M5 4.5h9a2.5 2.5 0 0 1 2.5 2.5v12.5H7A2 2 0 0 1 5 20Z" />
      <path d="M16.5 7H19v12.5H7" />
      <path d="M8 8.5h5M8 11h5" />
    </g>
  ),
  pin: (
    <g>
      <path d="M12 21c4-4.5 6-7.8 6-10.6A6 6 0 0 0 6 10.4C6 13.2 8 16.5 12 21Z" />
      <circle cx="12" cy="10.2" r="2.2" />
    </g>
  ),
  bolt: <path d="M13 2 4 14h7l-1 8 9-12h-7Z" />,
  sun: (
    <g>
      <circle cx="12" cy="12" r="4" />
      <path d="M12 2.4v2.6M12 19v2.6M4.2 4.2l1.8 1.8M18 18l1.8 1.8M2.4 12H5M19 12h2.6M4.2 19.8 6 18M18 6l1.8-1.8" />
    </g>
  ),
  moon: <path d="M20 13.4A8 8 0 1 1 10.6 4 6.4 6.4 0 0 0 20 13.4Z" />,
  check: <path d="m5 12.5 4.4 4.5L19 7" />,
  back: <path d="m15 6-6 6 6 6" />,
  droplet: <path d="M12 3.2s6 6.2 6 10.2a6 6 0 0 1-12 0c0-4 6-10.2 6-10.2Z" />,
  lock: (
    <g>
      <rect x="5" y="10.5" width="14" height="9.5" rx="2" />
      <path d="M8 10.5V7.5a4 4 0 0 1 8 0v3" />
    </g>
  ),
  lockOpen: (
    <g>
      <rect x="5" y="10.5" width="14" height="9.5" rx="2" />
      <path d="M8 10.5V7a4 4 0 0 1 7.8-1.2" />
    </g>
  ),
  reroll: (
    <g>
      <path d="M4.5 12a7.5 7.5 0 0 1 12.8-5.3L19.5 9" />
      <path d="M19.5 4.5V9H15" />
      <path d="M19.5 12a7.5 7.5 0 0 1-12.8 5.3L4.5 15" />
      <path d="M4.5 19.5V15H9" />
    </g>
  ),
};

export function Icon({ name, size = 22, stroke = 1.6, className = '', style = {} }) {
  const inner = ICON_PATHS[name];
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={stroke}
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      style={{ display: 'block', flex: '0 0 auto', ...style }}
      aria-hidden="true"
    >
      {inner}
    </svg>
  );
}
