// forge-tabs.js — descriptors for the Character Forge generation tabs.
// The classic tab keeps using SECTIONS/UI from i18n.js; the two alternative
// "lens" tabs add their own fields here. Field `key`s are stable identifiers
// shared with the server prompt builders in apps/hub/api/_core.js. Labels are
// ru/en; any other UI language falls back to en (same convention as the roll
// tables in i18n.js). New strings live here so the prettier-ignored, hand
// formatted i18n.js stays untouched.
import { SECTIONS, SECTION_ICONS, SECTION_EMOJI, UI } from './i18n.js';

// Tab order: the existing generator first, then the lenses, then the worksheet.
export const TAB_IDS = ['classic', 'drives', 'shadow', 'tables'];

// Each tab maps to a server generation mode (see _core.js mode whitelist).
export const TAB_MODE = {
  classic: 'full',
  drives: 'forge_drives',
  shadow: 'forge_shadow',
  tables: 'forge_tables',
};

// Tab-switcher labels. `tables` is the «Персонаж в трёх таблицах» worksheet
// method; the switcher label stays short so four tabs fit the 680px column.
const TAB_LABELS = {
  classic: { ru: 'Классический', en: 'Classic' },
  drives: { ru: 'Стремления', en: 'Drives & Fears' },
  shadow: { ru: 'Тень', en: 'Shadow' },
  tables: { ru: 'Три таблицы', en: 'Three Tables' },
};

// Group headings for worksheet-style tabs (their fields carry a `group` key;
// the result card renders a heading whenever the group changes).
const TAB_GROUP_LABELS = {
  tables: {
    quality: { ru: 'Таблица 1 „Качество“', en: 'Table 1 — Quality' },
    presentation: { ru: 'Таблица 2 „Представление“', en: 'Table 2 — Presentation' },
    layers: { ru: 'Таблица 3 „4 слоя личности“', en: 'Table 3 — Four Layers of Personality' },
  },
};

// Field descriptors for the alternative tabs: stable key + localized question
// label + line-icon (from the shared icon set, icons.jsx) + export emoji.
const DRIVES_FIELDS = [
  {
    key: 'flees',
    icon: 'bolt',
    emoji: '🏃',
    ru: 'К чему персонаж бежит или от чего убегает? Или и то и другое?',
    en: 'What is the character running toward, or away from — or both?',
  },
  {
    key: 'lie',
    icon: 'moon',
    emoji: '🌫️',
    ru: 'В какую ложь он верит?',
    en: 'What lie does the character believe?',
  },
  {
    key: 'loss',
    icon: 'droplet',
    emoji: '⏳',
    ru: 'Что будет потеряно, если ничего не изменится?',
    en: 'What will be lost if nothing changes?',
  },
];

const SHADOW_FIELDS = [
  {
    key: 'line',
    icon: 'lock',
    emoji: '🚫',
    ru: 'Линия, которую персонаж поклялся не пересекать',
    en: 'A line the character has sworn never to cross',
  },
  {
    key: 'unspoken_desire',
    icon: 'wand',
    emoji: '🤫',
    ru: 'Желание, которое он не признаёт вслух',
    en: 'A desire they will not admit aloud',
  },
  {
    key: 'regret',
    icon: 'back',
    emoji: '↩️',
    ru: 'Ошибка, которую он бы исправил, если бы мог',
    en: 'A mistake they would undo if they could',
  },
  {
    key: 'false_strength',
    icon: 'bolt',
    emoji: '🎭',
    ru: 'Слабость, замаскированная под силу',
    en: 'A weakness disguised as strength',
  },
  {
    key: 'feared_self',
    icon: 'npc',
    emoji: '👤',
    ru: 'Версия себя, которой он боится стать',
    en: 'The version of themselves they fear becoming',
  },
  {
    key: 'realization',
    icon: 'sun',
    emoji: '💡',
    ru: 'Момент, когда он понял, что ошибается',
    en: 'The moment they realized they were wrong',
  },
];

// «Персонаж в трёх таблицах»: 15 qualities in 3 contiguous groups. The ru/en
// strings are the short row labels; the full descriptions live server-side as
// the English question text (TABLES_FIELDS in _core.js, same keys).
const TABLES_FIELDS = [
  {
    key: 'alias',
    group: 'quality',
    icon: 'character',
    emoji: '📛',
    ru: 'Имя и прозвище',
    en: 'Name & Nickname',
  },
  { key: 'focus', group: 'quality', icon: 'token', emoji: '🌟', ru: 'Фокус', en: 'Focus' },
  { key: 'shtick', group: 'quality', icon: 'wand', emoji: '🃏', ru: 'Фишка', en: 'Shtick' },
  {
    key: 'motivation',
    group: 'quality',
    icon: 'bolt',
    emoji: '🔥',
    ru: 'Мотивация',
    en: 'Motivation',
  },
  {
    key: 'conscious_desire',
    group: 'quality',
    icon: 'pin',
    emoji: '🎯',
    ru: 'Осознанное желание',
    en: 'Conscious Desire',
  },
  {
    key: 'unconscious_desire',
    group: 'quality',
    icon: 'moon',
    emoji: '🌙',
    ru: 'Неосознанное желание',
    en: 'Unconscious Desire',
  },
  {
    key: 'weakness',
    group: 'quality',
    icon: 'droplet',
    emoji: '💔',
    ru: 'Слабость',
    en: 'Weakness',
  },
  {
    key: 'eye_catcher',
    group: 'presentation',
    icon: 'sun',
    emoji: '👁️',
    ru: 'Привлекает внимание',
    en: 'Eye-Catcher',
  },
  {
    key: 'appearance',
    group: 'presentation',
    icon: 'search',
    emoji: '🪞',
    ru: 'Три главных особенности внешности',
    en: 'Three Appearance Details',
  },
  {
    key: 'worldview',
    group: 'presentation',
    icon: 'book',
    emoji: '🧭',
    ru: 'Взгляд на мир',
    en: 'Worldview',
  },
  {
    key: 'behavior',
    group: 'presentation',
    icon: 'reroll',
    emoji: '🎬',
    ru: 'Поведение',
    en: 'Behavior',
  },
  {
    key: 'in_public',
    group: 'layers',
    icon: 'city',
    emoji: '🏛️',
    ru: 'В обществе',
    en: 'In Public',
  },
  {
    key: 'with_friends',
    group: 'layers',
    icon: 'tavern',
    emoji: '🍻',
    ru: 'С друзьями',
    en: 'With Friends',
  },
  { key: 'alone', group: 'layers', icon: 'lockOpen', emoji: '💭', ru: 'С собой', en: 'Alone' },
  { key: 'in_secret', group: 'layers', icon: 'lock', emoji: '🗝️', ru: 'В тайне', en: 'In Secret' },
];

// Field descriptors per tab. Classic is derived from the existing i18n tables
// so every tab renders through the same code path.
export const TAB_FIELDS = {
  classic: SECTIONS.map((key) => ({
    key,
    icon: SECTION_ICONS[key],
    emoji: SECTION_EMOJI[key],
  })),
  drives: DRIVES_FIELDS,
  shadow: SHADOW_FIELDS,
  tables: TABLES_FIELDS,
};

// Localized tab name, en fallback.
export function tabLabel(id, lang) {
  const l = TAB_LABELS[id] || TAB_LABELS.classic;
  return l[lang] ?? l.en;
}

// Localized group heading, en fallback; '' for tabs/groups without one.
export function groupLabel(tabId, groupKey, lang) {
  const g = TAB_GROUP_LABELS[tabId]?.[groupKey];
  return g ? (g[lang] ?? g.en) : '';
}

// Localized label for a field descriptor. Classic fields read from UI.sections
// (translated for all 10 languages); lens fields carry their own ru/en.
export function fieldLabel(tabId, field, lang) {
  if (tabId === 'classic') {
    const t = UI[lang] ?? UI.en;
    return (t.sections ?? UI.en.sections)[field.key];
  }
  return field[lang] ?? field.en;
}
