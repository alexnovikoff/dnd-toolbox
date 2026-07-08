import { render, screen, fireEvent, within } from '@testing-library/react';
import { ThemeProvider } from '@dnd/design-system';
import { manifest, Component } from './index.jsx';
import { UI, RACES, CLASSES, LAST_NAMES, firstNamesFor } from './i18n.js';
import { tabLabel, groupLabel, TAB_IDS, TAB_MODE, TAB_FIELDS } from './forge-tabs.js';

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

// Distinct answers for the "tables" worksheet tab (mode forge_tables).
const TABLES = {
  alias: 'Kael «Ember» Duskmantle.',
  focus: 'Fire mage of the last hearth.',
  shtick: 'Lies even when the truth is safer.',
  motivation: 'Warmth must never be rationed.',
  conscious_desire: 'Recover the stolen brazier of his order.',
  unconscious_desire: 'To be forgiven for the fire he set.',
  weakness: 'Cannot walk past anything left burning.',
  eye_catcher: 'Soot-black handprints seared into his cloak.',
  appearance: 'Cracked amber eyes, singed cuffs, a cold iron ring.',
  worldview: 'Every hearth is a promise someone made.',
  behavior: 'Relights every lamp in the room, uninvited.',
  in_public: 'Known as the arsonist the temple pardoned.',
  with_friends: 'Quietly mends their gear while they sleep.',
  alone: 'Counts the sparks he owes and to whom.',
  in_secret: 'Hopes the fire will one day answer back.',
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

// The language switcher is the only <select>; the race/class inputs are now
// comboboxes too (each carries a <datalist>), so disambiguate by tag.
function setLanguage(code) {
  const select = screen.getAllByRole('combobox').find((el) => el.tagName === 'SELECT');
  fireEvent.change(select, { target: { value: code } });
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
    expect(await screen.findByText(/Бесплатные генерации закончились/)).toBeInTheDocument();
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

    setLanguage('en');
    expect(screen.getByPlaceholderText(UI.en.namePlaceholder)).toBeInTheDocument();
    expect(screen.queryByPlaceholderText(UI.ru.namePlaceholder)).toBeNull();
  });

  it('offers race and class as editable dropdowns that follow the language', () => {
    const { container } = render(
      <ThemeProvider>
        <Component />
      </ThemeProvider>
    );
    const optionsOf = (input) => {
      const dl = container.querySelector(`datalist[id="${input.getAttribute('list')}"]`);
      return [...dl.querySelectorAll('option')].map((o) => o.value);
    };
    const raceInput = screen.getByPlaceholderText(UI.ru.racePlaceholder);
    const clsInput = screen.getByPlaceholderText(UI.ru.clsPlaceholder);

    // ru dropdown options by default
    expect(optionsOf(raceInput)).toEqual(RACES.map((r) => r.ru));
    expect(optionsOf(clsInput)).toEqual(CLASSES.map((c) => c.ru));

    // free text is still allowed — the input is not constrained to the list
    fireEvent.change(raceInput, { target: { value: 'Custom Lineage' } });
    expect(raceInput.value).toBe('Custom Lineage');

    // switching the language relocalizes the dropdown options
    setLanguage('en');
    expect(optionsOf(screen.getByPlaceholderText(UI.en.racePlaceholder))).toEqual(
      RACES.map((r) => r.en)
    );
  });

  it('shows a clear button only when a field has text and empties it on click', () => {
    render(
      <ThemeProvider>
        <Component />
      </ThemeProvider>
    );
    const nameInput = screen.getByPlaceholderText(UI.ru.namePlaceholder);

    // empty by default → no clear button
    expect(screen.queryByRole('button', { name: UI.ru.clear })).toBeNull();

    // typing reveals a clear button that empties the field on click
    fireEvent.change(nameInput, { target: { value: 'Kael' } });
    expect(nameInput.value).toBe('Kael');
    fireEvent.click(screen.getByRole('button', { name: UI.ru.clear }));
    expect(nameInput.value).toBe('');

    // it's per-field — the race clear targets only the race input
    const raceInput = screen.getByPlaceholderText(UI.ru.racePlaceholder);
    fireEvent.change(raceInput, { target: { value: 'Tiefling' } });
    fireEvent.click(screen.getByRole('button', { name: UI.ru.clear }));
    expect(raceInput.value).toBe('');
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
    // default gender is male, so the first name comes from the male pool
    expect(firstNamesFor('male').map((n) => n.ru)).toContain(first);
    expect(LAST_NAMES.map((n) => n.ru)).toContain(rest.join(' '));

    // after switching the language the dice roll from the en pool
    setLanguage('en');
    fireEvent.click(screen.getByRole('button', { name: UI.en.race }));
    expect(RACES.map((r) => r.en)).toContain(race.value);
  });

  it('rolls a first name matching the selected gender', () => {
    render(
      <ThemeProvider>
        <Component />
      </ThemeProvider>
    );
    // default gender is male → male pool
    fireEvent.click(screen.getByRole('button', { name: UI.ru.name }));
    let first = screen.getByPlaceholderText(UI.ru.namePlaceholder).value.split(' ')[0];
    expect(firstNamesFor('male').map((n) => n.ru)).toContain(first);

    // switching to female rolls from the female pool (the pools are disjoint)
    fireEvent.click(screen.getByRole('button', { name: UI.ru.female }));
    fireEvent.click(screen.getByRole('button', { name: UI.ru.name }));
    first = screen.getByPlaceholderText(UI.ru.namePlaceholder).value.split(' ')[0];
    expect(firstNamesFor('female').map((n) => n.ru)).toContain(first);
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

  it('drops other tabs results when generating for changed character inputs', async () => {
    mockFetchByMode({ full: FIELDS, forge_drives: DRIVES });
    render(
      <ThemeProvider>
        <Component />
      </ThemeProvider>
    );
    const nameInput = screen.getByPlaceholderText(UI.ru.namePlaceholder);
    fireEvent.change(nameInput, { target: { value: 'Kael' } });
    fireEvent.click(screen.getByRole('button', { name: /Создать персонажа/ }));
    expect(await screen.findByText(FIELDS.backstory)).toBeInTheDocument();

    // change the character inputs, then generate a different tab
    fireEvent.change(nameInput, { target: { value: 'Bryn' } });
    fireEvent.click(screen.getByRole('button', { name: tabLabel('drives', 'ru') }));
    fireEvent.click(screen.getByRole('button', { name: /Создать персонажа/ }));
    expect(await screen.findByText(DRIVES.flees)).toBeInTheDocument();

    // the classic result was for the old character — it has been dropped
    fireEvent.click(screen.getByRole('button', { name: tabLabel('classic', 'ru') }));
    expect(screen.queryByText(FIELDS.backstory)).toBeNull();
  });

  it('regenerates a single field on a lens tab via mode "section"', async () => {
    const NEW_FLEES = 'A reinvented flight from an older shame.';
    const fetchMock = vi.fn(async (url, opts) => {
      const body = JSON.parse(opts.body);
      if (body.mode === 'section') {
        return {
          ok: true,
          status: 200,
          json: async () => ({ fields: { [body.section]: NEW_FLEES } }),
        };
      }
      return { ok: true, status: 200, json: async () => ({ fields: DRIVES, remaining: 9 }) };
    });
    vi.stubGlobal('fetch', fetchMock);
    render(
      <ThemeProvider>
        <Component />
      </ThemeProvider>
    );
    fireEvent.change(screen.getByPlaceholderText(UI.ru.namePlaceholder), {
      target: { value: 'Kael' },
    });
    fireEvent.click(screen.getByRole('button', { name: tabLabel('drives', 'ru') }));
    fireEvent.click(screen.getByRole('button', { name: /Создать персонажа/ }));
    expect(await screen.findByText(DRIVES.flees)).toBeInTheDocument();

    // click the ↺ button inside the "flees" field card
    const card = screen.getByText(DRIVES.flees).closest('div');
    fireEvent.click(within(card).getByRole('button', { name: UI.ru.redo }));
    expect(await screen.findByText(NEW_FLEES)).toBeInTheDocument();

    // the regen request carried the lens field key as the section
    const sectionCall = fetchMock.mock.calls.find((c) => JSON.parse(c[1].body).mode === 'section');
    expect(JSON.parse(sectionCall[1].body).section).toBe('flees');
  });

  it('describes the tables tab: 15 grouped fields wired to mode forge_tables', () => {
    expect(TAB_IDS).toContain('tables');
    expect(TAB_MODE.tables).toBe('forge_tables');
    expect(tabLabel('tables', 'ru')).toBe('Три таблицы');
    expect(tabLabel('tables', 'en')).toBe('Three Tables');

    const fields = TAB_FIELDS.tables;
    // worksheet order is part of the method — pin it
    expect(fields.map((f) => f.key)).toEqual([
      'alias',
      'focus',
      'shtick',
      'motivation',
      'conscious_desire',
      'unconscious_desire',
      'weakness',
      'eye_catcher',
      'appearance',
      'worldview',
      'behavior',
      'in_public',
      'with_friends',
      'alone',
      'in_secret',
    ]);
    // three contiguous groups (heading renders on group change), full descriptors
    expect(fields.map((f) => f.group)).toEqual([
      ...Array(7).fill('quality'),
      ...Array(4).fill('presentation'),
      ...Array(4).fill('layers'),
    ]);
    for (const f of fields) {
      expect(f.icon).toBeTruthy();
      expect(f.emoji).toBeTruthy();
      expect(f.ru).toBeTruthy();
      expect(f.en).toBeTruthy();
    }
    for (const g of ['quality', 'presentation', 'layers']) {
      expect(groupLabel('tables', g, 'ru')).toMatch(/^Таблица \d/);
      expect(groupLabel('tables', g, 'en')).toMatch(/^Table \d/);
    }
    // tabs without groups keep an empty heading
    expect(groupLabel('classic', 'quality', 'ru')).toBe('');
  });

  it('generates the tables tab via mode forge_tables and renders group headings', async () => {
    const fetchMock = mockFetchByMode({ forge_tables: TABLES });
    render(
      <ThemeProvider>
        <Component />
      </ThemeProvider>
    );
    fireEvent.change(screen.getByPlaceholderText(UI.ru.namePlaceholder), {
      target: { value: 'Kael' },
    });
    fireEvent.click(screen.getByRole('button', { name: tabLabel('tables', 'ru') }));
    fireEvent.click(screen.getByRole('button', { name: /Создать персонажа/ }));

    expect(await screen.findByText(TABLES.alias)).toBeInTheDocument();
    expect(screen.getByText(TABLES.in_secret)).toBeInTheDocument();
    // one serif heading per group, in the active locale
    for (const g of ['quality', 'presentation', 'layers']) {
      expect(screen.getByText(groupLabel('tables', g, 'ru'))).toBeInTheDocument();
    }
    expect(JSON.parse(fetchMock.mock.calls[0][1].body).mode).toBe('forge_tables');
  });

  it('regenerates a single tables field via mode "section"', async () => {
    const NEW_FOCUS = 'Storm herald of a drowned coast.';
    const fetchMock = vi.fn(async (url, opts) => {
      const body = JSON.parse(opts.body);
      if (body.mode === 'section') {
        return {
          ok: true,
          status: 200,
          json: async () => ({ fields: { [body.section]: NEW_FOCUS } }),
        };
      }
      return { ok: true, status: 200, json: async () => ({ fields: TABLES, remaining: 9 }) };
    });
    vi.stubGlobal('fetch', fetchMock);
    render(
      <ThemeProvider>
        <Component />
      </ThemeProvider>
    );
    fireEvent.change(screen.getByPlaceholderText(UI.ru.namePlaceholder), {
      target: { value: 'Kael' },
    });
    fireEvent.click(screen.getByRole('button', { name: tabLabel('tables', 'ru') }));
    fireEvent.click(screen.getByRole('button', { name: /Создать персонажа/ }));
    expect(await screen.findByText(TABLES.focus)).toBeInTheDocument();

    // click the ↺ button inside the "focus" field card
    const card = screen.getByText(TABLES.focus).closest('div');
    fireEvent.click(within(card).getByRole('button', { name: UI.ru.redo }));
    expect(await screen.findByText(NEW_FOCUS)).toBeInTheDocument();

    const sectionCall = fetchMock.mock.calls.find((c) => JSON.parse(c[1].body).mode === 'section');
    expect(JSON.parse(sectionCall[1].body).section).toBe('focus');
  });

  it('copy-all on the tables tab includes group header lines', async () => {
    mockFetchByMode({ forge_tables: TABLES });
    const writeText = vi.fn(async () => {});
    vi.stubGlobal('navigator', { clipboard: { writeText } });
    render(
      <ThemeProvider>
        <Component />
      </ThemeProvider>
    );
    fireEvent.change(screen.getByPlaceholderText(UI.ru.namePlaceholder), {
      target: { value: 'Kael' },
    });
    fireEvent.click(screen.getByRole('button', { name: tabLabel('tables', 'ru') }));
    fireEvent.click(screen.getByRole('button', { name: /Создать персонажа/ }));
    expect(await screen.findByText(TABLES.alias)).toBeInTheDocument();

    fireEvent.click(screen.getByRole('button', { name: UI.ru.copyAll }));
    expect(await screen.findByText(UI.ru.copied)).toBeInTheDocument();
    const txt = writeText.mock.calls[0][0];
    // the first group follows the name header; later groups get a blank line
    expect(txt).toContain(`\n\n${groupLabel('tables', 'quality', 'ru')}\n`);
    expect(txt).toContain(`\n\n${groupLabel('tables', 'presentation', 'ru')}\n`);
    expect(txt).toContain(`📛 Имя и прозвище: ${TABLES.alias}`);
  });
});
