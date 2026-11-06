import { computeFrameMask } from './frame-mask.js';

const SIZE = 100;
const CENTER = (SIZE - 1) / 2;

// Builds RGBA pixels for a frame from an (x, y, radius from centre) → alpha painter.
function framePixels(alphaAt) {
  const rgba = new Uint8ClampedArray(SIZE * SIZE * 4);
  for (let y = 0; y < SIZE; y++) {
    for (let x = 0; x < SIZE; x++) {
      rgba[(y * SIZE + x) * 4 + 3] = alphaAt(x, y, Math.hypot(x - CENTER, y - CENTER));
    }
  }
  return rgba;
}

const isInside = (mask, x, y) => mask[y * SIZE + x] === 1;

// Opaque ring, radius 25–35, on a transparent background.
const ring = (r) => (r >= 25 && r <= 35 ? 255 : 0);

describe('computeFrameMask', () => {
  it('shows the portrait in the window of a frame smaller than the canvas', () => {
    const mask = computeFrameMask(
      framePixels((x, y, r) => ring(r)),
      SIZE,
      SIZE
    );
    expect(isInside(mask, 50, 50)).toBe(true);
  });

  it('hides the portrait on the transparent background around the frame', () => {
    const mask = computeFrameMask(
      framePixels((x, y, r) => ring(r)),
      SIZE,
      SIZE
    );
    expect(isInside(mask, 50, 90)).toBe(false); // radius 40, just past the ring
    expect(isInside(mask, 0, 0)).toBe(false);
  });

  it('follows the outline of a non-round frame', () => {
    const squareRing = (x, y) => {
      const d = Math.max(Math.abs(x - CENTER), Math.abs(y - CENTER));
      return d >= 25 && d <= 35 ? 255 : 0;
    };
    const mask = computeFrameMask(framePixels(squareRing), SIZE, SIZE);
    expect(isInside(mask, 50, 50)).toBe(true);
    expect(isInside(mask, 22, 22)).toBe(true); // window corner, beyond a circle of the same width
    expect(isInside(mask, 10, 10)).toBe(false);
  });

  it('keeps the portrait out from under a soft shadow around the frame', () => {
    const withShadow = (x, y, r) => (r > 35 && r <= 42 ? 90 : ring(r));
    const mask = computeFrameMask(framePixels(withShadow), SIZE, SIZE);
    expect(isInside(mask, 50, 88)).toBe(false); // radius 38, inside the shadow
    expect(isInside(mask, 50, 50)).toBe(true);
  });

  it('keeps the portrait out from under the anti-aliased outer edge', () => {
    const withSoftEdge = (x, y, r) => (r > 35 && r <= 37 ? 200 : ring(r));
    const mask = computeFrameMask(framePixels(withSoftEdge), SIZE, SIZE);
    expect(isInside(mask, 50, 86)).toBe(false); // radius 36, in the soft edge
  });

  it('still finds the window when the ring itself is translucent', () => {
    const glassRing = (x, y, r) => (r >= 25 && r <= 35 ? 180 : 0);
    const mask = computeFrameMask(framePixels(glassRing), SIZE, SIZE);
    expect(isInside(mask, 50, 50)).toBe(true);
    expect(isInside(mask, 50, 90)).toBe(false);
  });

  it('shows every pane of a window split by a crossbar', () => {
    const crossed = (x, y, r) => (r < 25 && Math.abs(x - CENTER) < 2 ? 255 : ring(r));
    const mask = computeFrameMask(framePixels(crossed), SIZE, SIZE);
    expect(isInside(mask, 40, 50)).toBe(true);
    expect(isInside(mask, 60, 50)).toBe(true);
    expect(isInside(mask, 50, 90)).toBe(false);
  });

  // A box of frame walls standing on one edge: what it holds touches that edge alone.
  it.each([
    ['top', (x, y) => [x, y], 50, 2],
    ['bottom', (x, y) => [x, 99 - y], 50, 97],
    ['left', (x, y) => [y, x], 2, 50],
    ['right', (x, y) => [y, 99 - x], 97, 50],
  ])('treats background touching only the %s edge as outside', (_, toEdge, px, py) => {
    const isBoxWall = (along, depth) =>
      (depth === 14 && along >= 40 && along <= 60) ||
      (depth < 14 && (along === 40 || along === 60));
    const boxed = (x, y, r) => (isBoxWall(...toEdge(x, y)) ? 255 : ring(r));
    const mask = computeFrameMask(framePixels(boxed), SIZE, SIZE);
    expect(isInside(mask, px, py)).toBe(false);
  });

  it('excludes a notch cut into the outer edge of the frame', () => {
    const notched = (x, y, r) => (x > 80 && Math.abs(y - CENTER) < 6 ? 0 : ring(r));
    const mask = computeFrameMask(framePixels(notched), SIZE, SIZE);
    expect(isInside(mask, 82, 50)).toBe(false);
    expect(isInside(mask, 50, 50)).toBe(true);
  });

  it('allows the whole canvas when the frame reaches every edge', () => {
    const opaqueWithHole = (x, y, r) => (r < 25 ? 0 : 255);
    const mask = computeFrameMask(framePixels(opaqueWithHole), SIZE, SIZE);
    expect(mask.every((v) => v === 1)).toBe(true);
  });

  describe('frame open to the background', () => {
    // A ring cut clean through on its right side (the wall spans x 74.5–84.5), so
    // the window is not enclosed.
    const openRing = (x, y, r) => (x > 70 && Math.abs(y - CENTER) < 6 ? 0 : ring(r));

    it('keeps the portrait in the window', () => {
      const mask = computeFrameMask(framePixels(openRing), SIZE, SIZE);
      expect(isInside(mask, 50, 50)).toBe(true);
    });

    it('bridges the gap in the ring', () => {
      const mask = computeFrameMask(framePixels(openRing), SIZE, SIZE);
      expect(isInside(mask, 81, 50)).toBe(true); // radius 31, in the gap
    });

    it('still hides the portrait outside the frame', () => {
      const mask = computeFrameMask(framePixels(openRing), SIZE, SIZE);
      expect(isInside(mask, 50, 90)).toBe(false);
      expect(isInside(mask, 0, 0)).toBe(false);
    });

    it('is not fooled by small enclosed pockets in the ornament', () => {
      // Pockets too small to be a window, carved out of the ring wall.
      const pocketed = (x, y, r) =>
        y < 25 && r >= 27 && r <= 33 && x % 6 < 2 ? 0 : openRing(x, y, r);
      const mask = computeFrameMask(framePixels(pocketed), SIZE, SIZE);
      expect(isInside(mask, 50, 50)).toBe(true);
    });
  });

  it('reports no mask for a fully transparent image', () => {
    expect(
      computeFrameMask(
        framePixels(() => 0),
        SIZE,
        SIZE
      )
    ).toBeNull();
  });
});
