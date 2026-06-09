// Navigation groups. Manifests carry a group *key*; the hub maps it to a
// localized display label and a fixed order (DESIGN_SYSTEM.md / MIGRATION §4).
export const GROUPS = [
  { key: 'creation', label: 'Создание' },
  { key: 'assets', label: 'Ассеты' },
  { key: 'locations', label: 'Локации' },
];

export const groupLabel = (key) => GROUPS.find((g) => g.key === key)?.label ?? key;
