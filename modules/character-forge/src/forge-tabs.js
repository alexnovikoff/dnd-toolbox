// forge-tabs.js — descriptors for the Character Forge generation tabs.
// The classic tab keeps using SECTIONS/UI from i18n.js; the two alternative
// "lens" tabs add their own fields here. Field `key`s are stable identifiers
// shared with the server prompt builders in apps/hub/api/_core.js. Labels are
// ru/en; any other UI language falls back to en (same convention as the roll
// tables in i18n.js). New strings live here so the prettier-ignored, hand
// formatted i18n.js stays untouched.
import { SECTIONS, SECTION_ICONS, SECTION_EMOJI, UI } from './i18n.js';

// Tab order: the existing generator first, then the two new lenses.
export const TAB_IDS = ['classic', 'drives', 'shadow'];

// Each tab maps to a server generation mode (see _core.js mode whitelist).
export const TAB_MODE = {
  classic: 'full',
  drives: 'forge_drives',
  shadow: 'forge_shadow',
};

// Tab-switcher labels.
const TAB_LABELS = {
  classic: { ru: 'Классический', en: 'Classic' },
  drives: { ru: 'Стремления', en: 'Drives & Fears' },
  shadow: { ru: 'Тень', en: 'Shadow' },
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
};

// Localized tab name, en fallback.
export function tabLabel(id, lang) {
  const l = TAB_LABELS[id] || TAB_LABELS.classic;
  return l[lang] ?? l.en;
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
