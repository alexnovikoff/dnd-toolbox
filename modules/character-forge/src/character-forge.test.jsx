import { render, screen, fireEvent } from '@testing-library/react';
import { ThemeProvider } from '@dnd/design-system';
import { manifest, Component } from './index.jsx';
import { UI, RACES, FIRST_NAMES, LAST_NAMES } from './i18n.js';
import { tabLabel } from './forge-tabs.js';

const FIELDS = {
  backstory: 'A quiet life upended by fire.',
  personality: 'Wry and watchful.',
  goals: 'Find the missing ledger.',
  flaws: 'Trusts no one.',
  secret_desire: 'To be forgiven.',
};

// Distinct answers for the "drives" lens tab (mode forge_drives).
const DRIVES = {
  flees: 'Runs toward a redemption that keeps receding.',
  lie: 'Believes mercy is a debt others owe.',
  loss: 'The last person who still calls them by name.',
};

function mockFetchOnce() {
  const fetchMock = vi.fn(async (url, opts) => {
    const body = JSON.parse(opts.body);
    expect(url).toBe('/api/generate');
    // the client must never send a key or raw model/messages
    expect(body).not.toHaveProperty('messages');
    expect(body).not.toHaveProperty('model');
    return {
      ok: true,
      status: 200,
      json: async () => ({ fields: FIELDS, remaining: 9 }),
    };
  });
  vi.stubGlobal('fetch', fetchMock);
  return fetchMock;
}

// Returns the field set keyed by the request `mode`, so a single render can
// generate on more than one tab.
function mockFetchByMode(byMode) {
  const fetchMock = vi.fn(async (url, opts) => {
    const body = JSON.parse(opts.body);
    const fields = byMode[body.mode] || FIELDS;
    return { ok: true, status: 200, json: async () => ({ fields, remaining: 9 }) };
  });
  vi.stubGlobal('fetch', fetchMock);
  return fetchMock;
}

describe('character-forge', () => {
  afterEach(() => {
    vi.unstubAllGlobals();
    localStorage.clear();
  });

  it('exposes a well-formed manifest', () => {
    expect(manifest).toMatchObject({
      id: 'character-forge',
      group: 'creation',
      icon: 'character',
      accent: '#c0563f',
      status: 'ready',
    });
  });

  it('generates a character via the /api/generate proxy', async () => {
    const fetchMock = mockFetchOnce();
    render(
      <ThemeProvider>
        <Component />
      </ThemeProvider>
    );
    expect(screen.getByText('Кузница Персонажей')).toBeInTheDocument();

    fireEvent.change(screen.getByPlaceholderText(UI.ru.namePlaceholder), {
      target: { value: 'Kael Duskmantle' },
    });
    fireEvent.click(screen.getByRole('button', { name: /Создать персонажа/ }));

    expect(await screen.findByText(FIELDS.backstory)).toBeInTheDocument();
    expect(screen.getByText(FIELDS.secret_desire)).toBeInTheDocument();
    expect(screen.getByText('Осталось бесплатных генераций: 9')).toBeInTheDocument();
    expect(fetchMock).toHaveBeenCalledTimes(1);
  });

  it('opens the API-key panel when the free quota is exhausted', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn(async () => ({
        ok: false,
        status: 402,
        json: async () => ({
          error: 'Free generations used up. Add your own Anthropic API key to continue.',
          code: 'free_quota_exhausted',
          remaining: 0,
        }),
      }))
    );
    render(
      <ThemeProvider>
        <Component />
      </ThemeProvider>
    );
    fireEvent.change(screen.getByPlaceholderText(UI.ru.namePlaceholder), {
      target: { value: 'Kael' },
    });
    fireEvent.click(screen.getByRole('button', { name: /Создать персонажа/ }));

    // localized quota message + the key input appear
    expect(
      await screen.findByText(/Бесплатные генерации закончились/)
    ).toBeInTheDocument();
    expect(screen.getByPlaceholderText('sk-ant-…')).toBeInTheDocument();
  });

  it('stores a user key and sends it as the BYOK header', async () => {
    const fetchMock = vi.fn(async (url, opts) => {
      expect(opts.headers['x-user-api-key']).toBe('sk-ant-user-0123456789');
      return { ok: true, status: 200, json: async () => ({ fields: FIELDS }) };
    });
    vi.stubGlobal('fetch', fetchMock);
    render(
      <ThemeProvider>
        <Component />
      </ThemeProvider>
    );

    // open the key panel, paste a key, save
    fireEvent.click(screen.getByRole('button', { name: /API-ключ/ }));
    fireEvent.change(screen.getByPlaceholderText('sk-ant-…'), {
      target: { value: 'sk-ant-user-0123456789' },
    });
    fireEvent.click(screen.getByRole('button', { name: 'Сохранить' }));
    expect(screen.getByText('Используется ваш API-ключ')).toBeInTheDocument();

    fireEvent.change(screen.getByPlaceholderText(UI.ru.namePlaceholder), {
      target: { value: 'Kael' },
    });
    fireEvent.click(screen.getByRole('button', { name: /Создать персонажа/ }));
    expect(await screen.findByText(FIELDS.backstory)).toBeInTheDocument();
    expect(fetchMock).toHaveBeenCalledTimes(1);
  });

  it('localizes the name/race/class placeholders and switches them with the language', () => {
    render(
      <ThemeProvider>
        <Component />
      </ThemeProvider>
    );
    // default language is ru
    expect(screen.getByPlaceholderText(UI.ru.namePlaceholder)).toBeInTheDocument();
    expect(screen.getByPlaceholderText(UI.ru.racePlaceholder)).toBeInTheDocument();
    expect(screen.getByPlaceholderText(UI.ru.clsPlaceholder)).toBeInTheDocument();

    fireEvent.change(screen.getByRole('combobox'), { target: { value: 'en' } });
    expect(screen.getByPlaceholderText(UI.en.namePlaceholder)).toBeInTheDocument();
    expect(screen.queryByPlaceholderText(UI.ru.namePlaceholder)).toBeNull();
  });

  it('rolls dice values from the pool of the selected language', () => {
    render(
      <ThemeProvider>
        <Component />
      </ThemeProvider>
    );
    fireEvent.click(screen.getByRole('button', { name: UI.ru.race }));
    const race = screen.getByPlaceholderText(UI.ru.racePlaceholder);
    expect(RACES.map((r) => r.ru)).toContain(race.value);

    fireEvent.click(screen.getByRole('button', { name: UI.ru.name }));
    const [first, ...rest] = screen.getByPlaceholderText(UI.ru.namePlaceholder).value.split(' ');
    expect(FIRST_NAMES.map((n) => n.ru)).toContain(first);
    expect(LAST_NAMES.map((n) => n.ru)).toContain(rest.join(' '));

    // after switching the language the dice roll from the en pool
    fireEvent.change(screen.getByRole('combobox'), { target: { value: 'en' } });
    fireEvent.click(screen.getByRole('button', { name: UI.en.race }));
    expect(RACES.map((r) => r.en)).toContain(race.value);
  });

  it('generates the active alternative tab and sends its mode', async () => {
    const fetchMock = mockFetchByMode({ forge_drives: DRIVES });
    render(
      <ThemeProvider>
        <Component />
      </ThemeProvider>
    );
    fireEvent.change(screen.getByPlaceholderText(UI.ru.namePlaceholder), {
      target: { value: 'Kael' },
    });
    // switch to the "drives" lens tab, then generate
    fireEvent.click(screen.getByRole('button', { name: tabLabel('drives', 'ru') }));
    fireEvent.click(screen.getByRole('button', { name: /Создать персонажа/ }));

    expect(await screen.findByText(DRIVES.flees)).toBeInTheDocument();
    expect(screen.getByText(DRIVES.loss)).toBeInTheDocument();
    const sent = JSON.parse(fetchMock.mock.calls[0][1].body);
    expect(sent.mode).toBe('forge_drives');
  });

  it('keeps each tab result independent across tab switches', async () => {
    mockFetchByMode({ full: FIELDS, forge_drives: DRIVES });
    render(
      <ThemeProvider>
        <Component />
      </ThemeProvider>
    );
    fireEvent.change(screen.getByPlaceholderText(UI.ru.namePlaceholder), {
      target: { value: 'Kael' },
    });
    // generate the classic tab
    fireEvent.click(screen.getByRole('button', { name: /Создать персонажа/ }));
    expect(await screen.findByText(FIELDS.backstory)).toBeInTheDocument();

    // switch to drives and generate — classic result leaves the view
    fireEvent.click(screen.getByRole('button', { name: tabLabel('drives', 'ru') }));
    fireEvent.click(screen.getByRole('button', { name: /Создать персонажа/ }));
    expect(await screen.findByText(DRIVES.flees)).toBeInTheDocument();
    expect(screen.queryByText(FIELDS.backstory)).toBeNull();

    // switch back — the classic result is still there, not reset
    fireEvent.click(screen.getByRole('button', { name: tabLabel('classic', 'ru') }));
    expect(screen.getByText(FIELDS.backstory)).toBeInTheDocument();
  });
});
