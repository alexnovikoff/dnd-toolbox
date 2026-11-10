// data.js — every content table of the Loot Generator in one object.
// The tables are written for this tool (not copied from a rulebook), apart from
// magic item and spell names, which come from SRD 5.2.1. Each entry carries
// both languages, so switching language never rerolls a find.
import {
  BOUNTIES,
  CATEGORIES,
  COINS,
  KINDS,
  LUCK,
  RARITIES,
  REWARD_MIXES,
  SCROLL_SHARE,
  THEME_MIXES,
  THEMES,
  TIERS,
} from './tables/tiers.js';
import { ART, GEM_DETAILS, GEMS, GOODS } from './tables/valuables.js';
import { ITEMS, VARIANTS } from './tables/items.js';
import { SCROLL_STATS, SPELLS } from './tables/spells.js';
import { CATCHES, FORMS, GUARDS, HOOKS, ORIGINS, PATRONS, PERKS, PLACES } from './tables/story.js';
import { MARKS, TRINKETS } from './tables/trinkets.js';

export const LOOT_DATA = {
  coins: COINS,
  kinds: KINDS,
  themes: THEMES,
  bounties: BOUNTIES,
  rarities: RARITIES,
  categories: CATEGORIES,
  luck: LUCK,
  tiers: TIERS,
  themeMixes: THEME_MIXES,
  rewardMixes: REWARD_MIXES,
  scrollShare: SCROLL_SHARE,
  gems: GEMS,
  gemDetails: GEM_DETAILS,
  art: ART,
  goods: GOODS,
  items: ITEMS,
  variants: VARIANTS,
  spells: SPELLS,
  scrollStats: SCROLL_STATS,
  origins: ORIGINS,
  places: PLACES,
  guards: GUARDS,
  hooks: HOOKS,
  patrons: PATRONS,
  forms: FORMS,
  perks: PERKS,
  catches: CATCHES,
  trinkets: TRINKETS,
  marks: MARKS,
};
