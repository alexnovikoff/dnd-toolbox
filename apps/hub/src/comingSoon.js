// Placeholder manifests for modules that are planned but not built yet. They
// render on the launcher ("Скоро в наборе") and in the sidebar (dimmed). When a
// real module ships, add it to registry.js and remove its placeholder here.
export const COMING_SOON = [
  {
    id: 'npc',
    name: 'NPC Generator',
    description: 'Имена, внешность, черты и мотивы',
    group: 'creation',
    icon: 'npc',
    accent: '#8a6cc0',
    status: 'soon',
  },
  {
    id: 'loot',
    name: 'Loot Generator',
    description: 'Клады и награды, сбалансированные по CR',
    group: 'creation',
    icon: 'loot',
    accent: '#c9a84c',
    status: 'soon',
  },
  {
    id: 'tavern',
    name: 'Tavern Builder',
    description: 'Заведения, меню, завсегдатаи и слухи',
    group: 'locations',
    icon: 'tavern',
    accent: '#b07a3f',
    status: 'soon',
  },
  {
    id: 'city',
    name: 'City Forge',
    description: 'Города, районы и враждующие фракции',
    group: 'locations',
    icon: 'city',
    accent: '#5f8190',
    status: 'soon',
  },
];
