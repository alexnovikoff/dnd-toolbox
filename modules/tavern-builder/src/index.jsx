// @dnd/tavern-builder — module entry: { manifest, Component }.
import Component from './TavernBuilder.jsx';

export const manifest = {
  id: 'tavern',
  name: 'Tavern Builder',
  description: 'Заведения, меню, завсегдатаи и слухи',
  group: 'locations', // creation | assets | locations
  icon: 'tavern', // name from the shared icon set
  accent: '#b07a3f', // permanent color tag (DESIGN_SYSTEM.md §4)
  status: 'ready', // ready | soon
};

export { Component };
