// data.js — every content table of the NPC Generator in one object.
// The tables are written for this tool (not copied from a rulebook). Each entry
// carries both languages, so switching language never rerolls an NPC.
import { RACES } from './tables/names.js';
import { OCC_CATEGORIES, OCCUPATIONS, STATS } from './tables/occupations.js';
import { FEATURES, MANNERS, MOODS, WANTS } from './tables/scene.js';
import { BACKGROUNDS, HOOKS, KNOWS, LEVERS, SECRETS } from './tables/depth.js';
import { OFFERS, PLANS, TACTICS, TALKS, TIES } from './tables/plot.js';

export const NPC_DATA = {
  levels: [
    { id: 'passerby', ru: 'Прохожий', en: 'Passerby' },
    { id: 'recurring', ru: 'Постоянный', en: 'Recurring' },
    { id: 'key', ru: 'Ключевой', en: 'Key' },
  ],
  tones: [
    { id: 'any', ru: 'Любой', en: 'Any' },
    { id: 'plain', ru: 'Обыденный', en: 'Everyday' },
    { id: 'grim', ru: 'Мрачный', en: 'Grim' },
    { id: 'comic', ru: 'Комичный', en: 'Comic' },
  ],
  genders: {
    m: { ru: 'мужчина', en: 'male' },
    f: { ru: 'женщина', en: 'female' },
  },
  races: RACES,
  occCategories: OCC_CATEGORIES,
  occupations: OCCUPATIONS,
  stats: STATS,
  features: FEATURES,
  manners: MANNERS,
  moods: MOODS,
  wants: WANTS,
  knows: KNOWS,
  secrets: SECRETS,
  levers: LEVERS,
  backgrounds: BACKGROUNDS,
  hooks: HOOKS,
  plans: PLANS,
  offers: OFFERS,
  talks: TALKS,
  ties: TIES,
  tactics: TACTICS,
};
