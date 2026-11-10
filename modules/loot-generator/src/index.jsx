// @dnd/loot-generator — module entry: { manifest, Component }.
import Component from './LootGenerator.jsx';

export const manifest = {
  id: 'loot',
  name: 'Loot Generator',
  description: 'Клады и награды, сбалансированные по CR',
  group: 'creation', // creation | assets | locations
  icon: 'loot', // name from the shared icon set
  accent: '#c9a84c', // permanent color tag (DESIGN_SYSTEM.md §4)
  status: 'ready', // ready | soon
};

export { Component };
