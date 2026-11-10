// Placeholder manifests for modules that are planned but not built yet. They
// render on the launcher ("Скоро в наборе") and in the sidebar (dimmed). When a
// real module ships, add it to registry.js and remove its placeholder here.
export const COMING_SOON = [
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
