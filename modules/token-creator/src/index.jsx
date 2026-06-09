// @dnd/token-creator — module entry: { manifest, Component }.
import Component from './TokenCreator.jsx';

export const manifest = {
  id: 'token-creator',
  name: 'Token Creator',
  description: 'Токены с рамками для Foundry и стола',
  group: 'assets', // creation | assets | locations
  icon: 'token', // name from the shared icon set
  accent: '#3f93a0', // permanent color tag (DESIGN_SYSTEM.md §4)
  status: 'ready', // ready | soon
};

export { Component };
