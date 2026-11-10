// @dnd/npc-generator — module entry: { manifest, Component }.
import Component from './NpcGenerator.jsx';

export const manifest = {
  id: 'npc',
  name: 'NPC Generator',
  description: 'Имена, внешность, черты и мотивы',
  group: 'creation', // creation | assets | locations
  icon: 'npc', // name from the shared icon set
  accent: '#8a6cc0', // permanent color tag (DESIGN_SYSTEM.md §4)
  status: 'ready', // ready | soon
};

export { Component };
