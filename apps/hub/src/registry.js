// registry.js — the single point of module registration.
//
// Add a module = create modules/<id>/ exporting { manifest, Component }, then
// add ONE import + one array entry below. The launcher and sidebar build
// themselves from these manifests; nothing else needs editing.
import * as characterForge from '@dnd/character-forge';
import * as tokenCreator from '@dnd/token-creator';
import * as tavernBuilder from '@dnd/tavern-builder';

export const MODULES = [characterForge, tokenCreator, tavernBuilder];

export const manifests = MODULES.map((m) => m.manifest);

export function getModule(id) {
  return MODULES.find((m) => m.manifest.id === id);
}
