// @dnd/character-forge — module entry: { manifest, Component }.
import Component from './CharacterForge.jsx';

export const manifest = {
  id: 'character-forge',
  name: 'Character Forge',
  description: 'Готовый персонаж: раса, класс, статы, предыстория',
  group: 'creation', // creation | assets | locations
  icon: 'character', // name from the shared icon set
  accent: '#c0563f', // permanent color tag (DESIGN_SYSTEM.md §4)
  status: 'ready', // ready | soon
};

export { Component };
