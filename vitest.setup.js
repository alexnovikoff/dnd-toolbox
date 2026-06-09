import '@testing-library/jest-dom/vitest';

// jsdom has no canvas implementation. The Token Creator guards a null context,
// so we stub getContext to keep tests quiet and deterministic.
if (typeof HTMLCanvasElement !== 'undefined') {
  HTMLCanvasElement.prototype.getContext = () => null;
}
