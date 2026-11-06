// frame-mask.js — where a custom PNG frame lets the portrait show.
//
// A PNG frame can be any size and shape inside the canvas, so a fixed circular
// clip lets the portrait leak onto the frame's transparent background. The mask
// is the frame's outer silhouette instead: everything except the background
// reachable from the canvas edge without crossing the frame.

// Alpha at which a pixel counts as a wall, strictest first. 250 keeps the portrait
// out from under anti-aliased edges and soft shadows; 128 is for frames whose ring
// is itself translucent, which a flood at 250 would pass straight through.
const WALL_ALPHA_LEVELS = [250, 128];
const LENIENT_ALPHA = WALL_ALPHA_LEVELS[WALL_ALPHA_LEVELS.length - 1];

// A see-through pocket covering at least this share of the canvas is a window;
// anything smaller is ornament detail.
const MIN_WINDOW_SHARE = 0.01;

const UNSEEN = 0;
const WALL = 1;
const OUTSIDE = 2;
const POCKET = 3;

// Marks the UNSEEN region around `start` and returns its size. 4-connected, so a
// diagonal run of wall pixels still holds the flood back.
function flood(state, w, start, mark, stack) {
  const n = state.length;
  let top = 0;
  let size = 0;
  const visit = (i) => {
    if (state[i] === UNSEEN) {
      state[i] = mark;
      stack[top++] = i;
    }
  };
  visit(start);
  while (top > 0) {
    const i = stack[--top];
    size++;
    if (i % w > 0) visit(i - 1);
    if (i % w < w - 1) visit(i + 1);
    if (i >= w) visit(i - w);
    if (i < n - w) visit(i + w);
  }
  return size;
}

// The frame's silhouette at this wall level, or null if the frame encloses no window.
function silhouetteMask(rgba, w, h, wallAlpha) {
  const n = w * h;
  const state = new Uint8Array(n);
  const stack = new Int32Array(n);
  for (let i = 0; i < n; i++) {
    if (rgba[i * 4 + 3] >= wallAlpha) state[i] = WALL;
  }
  for (let x = 0; x < w; x++) {
    flood(state, w, x, OUTSIDE, stack);
    flood(state, w, (h - 1) * w + x, OUTSIDE, stack);
  }
  for (let y = 0; y < h; y++) {
    flood(state, w, y * w, OUTSIDE, stack);
    flood(state, w, y * w + w - 1, OUTSIDE, stack);
  }
  let largestPocket = 0;
  for (let i = 0; i < n; i++) {
    if (state[i] === UNSEEN)
      largestPocket = Math.max(largestPocket, flood(state, w, i, POCKET, stack));
  }
  if (largestPocket < n * MIN_WINDOW_SHARE) return null;
  return state.map((v) => (v === OUTSIDE ? 0 : 1));
}

// Reduces one side's per-row extreme points (ordered by y) to its convex chain.
// `side` is -1 for the left edge, 1 for the right.
function convexChain(points, side) {
  const chain = [];
  for (const [px, py] of points) {
    while (chain.length >= 2) {
      const [ax, ay] = chain[chain.length - 2];
      const [bx, by] = chain[chain.length - 1];
      if (((bx - ax) * (py - ay) - (by - ay) * (px - ax)) * side > 0) break;
      chain.pop();
    }
    chain.push([px, py]);
  }
  return chain;
}

// The x of a chain at each row it spans.
function traceChain(chain, h) {
  const xs = new Float32Array(h);
  xs[chain[0][1]] = chain[0][0];
  for (let k = 1; k < chain.length; k++) {
    const [ax, ay] = chain[k - 1];
    const [bx, by] = chain[k];
    for (let y = ay; y <= by; y++) xs[y] = ax + ((y - ay) * (bx - ax)) / (by - ay);
  }
  return xs;
}

// Convex hull of the frame's pixels, or null if the image is empty. For frames open
// to the background (a wreath with gaps), where no flood can separate window from
// background.
function hullMask(rgba, w, h, wallAlpha) {
  const leftmost = [];
  const rightmost = [];
  for (let y = 0; y < h; y++) {
    let first = -1;
    let last = -1;
    for (let x = 0; x < w; x++) {
      if (rgba[(y * w + x) * 4 + 3] >= wallAlpha) {
        if (first < 0) first = x;
        last = x;
      }
    }
    if (first >= 0) {
      leftmost.push([first, y]);
      rightmost.push([last, y]);
    }
  }
  if (leftmost.length === 0) return null;

  const left = traceChain(convexChain(leftmost, -1), h);
  const right = traceChain(convexChain(rightmost, 1), h);
  const mask = new Uint8Array(w * h);
  for (let y = leftmost[0][1]; y <= leftmost[leftmost.length - 1][1]; y++) {
    mask.fill(1, y * w + Math.ceil(left[y]), y * w + Math.floor(right[y]) + 1);
  }
  return mask;
}

/**
 * Computes where the portrait may show under a frame.
 * @param {ArrayLike<number>} rgba frame pixels, RGBA, row by row
 * @returns {Uint8Array|null} 1 where the portrait may show, 0 where not; null if
 *   the image is fully transparent and says nothing about shape
 */
export function computeFrameMask(rgba, w, h) {
  for (const wallAlpha of WALL_ALPHA_LEVELS) {
    const mask = silhouetteMask(rgba, w, h, wallAlpha);
    if (mask) return mask;
  }
  return hullMask(rgba, w, h, LENIENT_ALPHA);
}

function renderMask(img, size) {
  const cv = document.createElement('canvas');
  cv.width = cv.height = size;
  const c = cv.getContext('2d', { willReadFrequently: true });
  c.drawImage(img, 0, 0, size, size);
  const mask = computeFrameMask(c.getImageData(0, 0, size, size).data, size, size);
  if (!mask) return null;
  const pixels = c.createImageData(size, size);
  mask.forEach((v, i) => {
    pixels.data[i * 4 + 3] = v ? 255 : 0;
  });
  c.putImageData(pixels, 0, 0);
  return cv;
}

const masks = new WeakMap(); // frame image → Map(size → mask canvas | null)

/**
 * Mask canvas for a frame image drawn at `size`, for `destination-in` compositing.
 * Cached per image and size: the canvas re-renders on every drag and zoom step.
 * @returns {HTMLCanvasElement|null} null if the image gives no shape to follow
 */
export function getFrameMask(img, size) {
  let bySize = masks.get(img);
  if (!bySize) {
    bySize = new Map();
    masks.set(img, bySize);
  }
  if (!bySize.has(size)) bySize.set(size, renderMask(img, size));
  return bySize.get(size);
}
