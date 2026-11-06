import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { ThemeProvider } from '@dnd/design-system';
import { manifest, Component } from './index.jsx';
import { frameDefs } from './frames.js';

// jsdom has no canvas: this context records what gets drawn, and in which composite
// mode. Pixel reads come back fully opaque, which gives any frame image a mask.
function recordingContext() {
  const saved = [];
  const ctx = {
    globalCompositeOperation: 'source-over',
    drawn: [],
    save: () => saved.push(ctx.globalCompositeOperation),
    restore: () => {
      ctx.globalCompositeOperation = saved.pop();
    },
    drawImage: (source, ...at) => ctx.drawn.push({ source, at, op: ctx.globalCompositeOperation }),
    getImageData: (x, y, w, h) => ({ data: new Uint8ClampedArray(w * h * 4).fill(255) }),
    createImageData: (w, h) => ({ data: new Uint8ClampedArray(w * h * 4) }),
  };
  return new Proxy(ctx, {
    get: (target, key) => (key in target ? target[key] : () => ({ addColorStop() {} })),
  });
}

describe('token-creator export', () => {
  let exported; // context of the canvas handed to toBlob
  let lastImage;

  beforeEach(() => {
    const contexts = new WeakMap();
    vi.spyOn(HTMLCanvasElement.prototype, 'getContext').mockImplementation(function () {
      if (!contexts.has(this)) contexts.set(this, recordingContext());
      return contexts.get(this);
    });
    vi.spyOn(HTMLCanvasElement.prototype, 'toBlob').mockImplementation(function () {
      exported = contexts.get(this);
    });
    vi.stubGlobal(
      'Image',
      class {
        naturalWidth = 512;
        naturalHeight = 512;
        constructor() {
          lastImage = this;
        }
        set src(url) {
          if (url) queueMicrotask(() => this.onload());
        }
      }
    );
    render(
      <ThemeProvider>
        <Component />
      </ThemeProvider>
    );
  });

  afterEach(() => {
    vi.restoreAllMocks();
    vi.unstubAllGlobals();
  });

  const loadFrame = async () => {
    const file = new File(['png'], 'frame.png', { type: 'image/png' });
    fireEvent.drop(screen.getByText(/Перетащите PNG-рамку/), { dataTransfer: { files: [file] } });
    await screen.findByText('+ Добавить');
    return lastImage;
  };
  const exportPng = () => fireEvent.click(screen.getByText(/Экспорт PNG/));

  it('exports the frame on preview before it joins the collection', async () => {
    const frame = await loadFrame();
    exportPng();
    expect(exported.drawn).toContainEqual({
      source: frame,
      at: [0, 0, 512, 512],
      op: 'source-over',
    });
  });

  it('limits the exported portrait to that frame, drawing the frame on top', async () => {
    const frame = await loadFrame();
    exportPng();
    const { drawn } = exported;
    const maskAt = drawn.findIndex((d) => d.op === 'destination-in');
    expect(drawn[maskAt]?.source).toBeInstanceOf(HTMLCanvasElement);
    expect(drawn.findIndex((d) => d.source === frame)).toBeGreaterThan(maskAt);
  });

  it('exports a frame added to the collection', async () => {
    const frame = await loadFrame();
    fireEvent.click(screen.getByText('+ Добавить'));
    exportPng();
    expect(exported.drawn).toContainEqual({
      source: frame,
      at: [0, 0, 512, 512],
      op: 'source-over',
    });
  });

  it('goes back to the active frame when the loaded one is cancelled', async () => {
    const builtIn = vi.spyOn(frameDefs[0], 'fn');
    const frame = await loadFrame();
    fireEvent.click(screen.getByText('Отмена'));
    exportPng();
    const callsOnExport = builtIn.mock.calls.filter(([ctx]) => ctx === exported);
    expect(callsOnExport.map(([, size]) => size)).toEqual([512]);
    expect(exported.drawn.map((d) => d.source)).not.toContain(frame);
  });
});

describe('token-creator file name', () => {
  beforeEach(() => {
    vi.stubGlobal(
      'Image',
      class {
        naturalWidth = 512;
        naturalHeight = 512;
        set src(url) {
          if (url) queueMicrotask(() => this.onload());
        }
      }
    );
    render(
      <ThemeProvider>
        <Component />
      </ThemeProvider>
    );
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  const dropOn = (zone, name) => {
    const file = new File(['img'], name, { type: 'image/png' });
    fireEvent.drop(screen.getByText(zone), { dataTransfer: { files: [file] } });
  };
  const fileNameField = () => screen.getByPlaceholderText('token');

  it.each([
    ['hero.png', 'hero_token'],
    ['hero.v2.jpg', 'hero.v2_token'],
    ['hero', 'hero_token'],
    ['Гном воин.webp', 'Гном воин_token'],
  ])('names the token after the portrait file %s', async (name, expected) => {
    dropOn(/Перетащите изображение/, name);
    await waitFor(() => expect(fileNameField()).toHaveValue(expected));
  });

  it('follows the portrait when it is replaced', async () => {
    dropOn(/Перетащите изображение/, 'first.png');
    await screen.findByText(/Изображение загружено/);
    dropOn(/Изображение загружено/, 'second.png');
    await waitFor(() => expect(fileNameField()).toHaveValue('second_token'));
  });

  it('keeps a name typed after the portrait loaded', async () => {
    dropOn(/Перетащите изображение/, 'hero.png');
    await screen.findByText(/Изображение загружено/);
    fireEvent.change(fileNameField(), { target: { value: 'boss' } });
    expect(fileNameField()).toHaveValue('boss');
  });

  it('does not rename the token when a frame is loaded', async () => {
    dropOn(/Перетащите PNG-рамку/, 'frame.png');
    await screen.findByText('+ Добавить');
    expect(fileNameField()).toHaveValue('');
  });
});

describe('token-creator', () => {
  it('exposes a well-formed manifest', () => {
    expect(manifest).toMatchObject({
      id: 'token-creator',
      group: 'assets',
      icon: 'token',
      accent: '#3f93a0',
      status: 'ready',
    });
  });

  it('renders all 10 built-in frames and the controls', () => {
    render(
      <ThemeProvider>
        <Component />
      </ThemeProvider>
    );
    // built-in frame names (rendered as labels)
    for (const name of [
      'Foundry Steel',
      'Foundry Bronze',
      'Gold Ornate',
      'Silver Clean',
      'Dark Iron',
      'Wooden',
      'Arcane',
      'Nature',
      'Draconic',
      'Celestial',
    ]) {
      expect(screen.getAllByText(name).length).toBeGreaterThan(0);
    }
    expect(screen.getByText(/Масштаб/)).toBeInTheDocument();
    expect(screen.getByText(/Экспорт PNG/)).toBeInTheDocument();
  });
});
