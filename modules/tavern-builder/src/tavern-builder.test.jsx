import { render, screen, fireEvent } from '@testing-library/react';
import { ThemeProvider } from '@dnd/design-system';
import { manifest, Component } from './index.jsx';

// A fixed tavern seeded into localStorage: the component must load it instead
// of rolling a random one, which keeps every assertion deterministic.
const TAVERN = {
  identity: {
    adj: { ru: ['Пьяный', 'Пьяная', 'Пьяное'], en: 'Drunken' },
    noun: { ru: 'Кабан', g: 0, en: 'Boar' },
    sign: { ru: 'Кованая вывеска поскрипывает.', en: 'A wrought-iron sign creaks.' },
    light: { ru: 'Тёплый свет.', en: 'Warm light.' },
    smell: { ru: 'Пахнет хлебом.', en: 'Smells of bread.' },
    detail: { ru: 'У огня дремлет пёс.', en: 'A dog dozes by the fire.' },
    crowd: { ru: 'Зал полупуст.', en: 'The room is half empty.' },
    aiDesc: null,
    aiLang: null,
  },
  menu: {
    food: [{ ru: 'Жаркое из кролика', en: 'Rabbit stew', pr: '4 см', pe: '4 sp' }],
    drinks: [{ ru: 'Тёмный эль', en: 'Dark ale', pr: '8 мм', pe: '8 cp' }],
  },
  people: {
    owner: {
      name: { ru: 'Барлен', en: 'Barlen' },
      race: { ru: 'дварф', en: 'dwarf' },
      trait: { ru: 'Помнит каждый долг.', en: 'Remembers every debt.' },
      quirk: { ru: 'Зовёт всех «капитан».', en: 'Calls every guest “captain”.' },
      secret: { ru: 'Прячет беглеца.', en: 'Is hiding a fugitive.' },
    },
    staff: [
      {
        name: { ru: 'Мирра', en: 'Mirra' },
        role: { ru: 'Повар', en: 'Cook' },
        detail: { ru: 'ругается на трёх языках', en: 'swears in three languages' },
      },
    ],
  },
  patrons: [
    {
      who: { ru: 'Седой картограф', en: 'A grizzled cartographer' },
      doing: { ru: 'раскладывает карты', en: 'spreads out maps' },
    },
  ],
  rumors: [{ ru: 'Свет на мельнице.', en: 'A light in the mill.', truth: 'true' }],
};

function seedState(overrides = {}) {
  localStorage.setItem(
    'ddtb_tavern',
    JSON.stringify({
      params: { tone: 'cozy', wealth: 1, size: 1 },
      lang: 'ru',
      locks: {},
      tavern: TAVERN,
      ...overrides,
    })
  );
}

function renderModule() {
  return render(
    <ThemeProvider>
      <Component />
    </ThemeProvider>
  );
}

describe('tavern-builder', () => {
  afterEach(() => {
    vi.unstubAllGlobals();
    localStorage.clear();
  });

  it('exposes a well-formed manifest', () => {
    expect(manifest).toMatchObject({
      id: 'tavern',
      group: 'locations',
      icon: 'tavern',
      accent: '#b07a3f',
      status: 'ready',
    });
  });

  it('renders all five sections from the persisted state', () => {
    seedState();
    renderModule();
    for (const title of [
      'Заведение',
      'Меню',
      'Хозяин и персонал',
      'Завсегдатаи',
      'Слухи и зацепки',
    ]) {
      expect(screen.getByText(title)).toBeInTheDocument();
    }
    expect(screen.getByText('«Пьяный Кабан»')).toBeInTheDocument();
    expect(screen.getByText('Барлен')).toBeInTheDocument();
    expect(screen.getByText('Жаркое из кролика')).toBeInTheDocument();
    expect(screen.getByText('Свет на мельнице.')).toBeInTheDocument();
  });

  it('switches the content language instantly without regenerating', () => {
    seedState();
    renderModule();
    fireEvent.click(screen.getByRole('button', { name: 'ENG' }));
    // same table entries, other locale — proof nothing was rerolled
    expect(screen.getByText('The Drunken Boar')).toBeInTheDocument();
    expect(screen.getByText('Barlen')).toBeInTheDocument();
    expect(screen.getByText('Rabbit stew')).toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: 'РУС' }));
    expect(screen.getByText('«Пьяный Кабан»')).toBeInTheDocument();
  });

  it('persists a parameter change to localStorage', () => {
    seedState();
    renderModule();
    fireEvent.click(screen.getByRole('button', { name: 'Злачная' }));
    const saved = JSON.parse(localStorage.getItem('ddtb_tavern'));
    expect(saved.params.tone).toBe('seedy');
  });

  it('keeps a locked block through «Сгенерировать»', () => {
    seedState({ locks: { identity: true } });
    renderModule();
    fireEvent.click(screen.getByRole('button', { name: /Сгенерировать/ }));
    expect(screen.getByText('«Пьяный Кабан»')).toBeInTheDocument();
  });

  it('enlivens the description via the /api/generate proxy', async () => {
    seedState();
    const fetchMock = vi.fn(async (url, opts) => {
      const body = JSON.parse(opts.body);
      expect(url).toBe('/api/generate');
      expect(body.mode).toBe('tavern_enliven');
      expect(body.facts).toContain('Пьяный Кабан');
      expect(body.lang).toBe('ru');
      // the client must never send a key or raw model/messages
      expect(body).not.toHaveProperty('messages');
      expect(body).not.toHaveProperty('model');
      return { ok: true, status: 200, json: async () => ({ text: 'Дым стелется над столами.' }) };
    });
    vi.stubGlobal('fetch', fetchMock);
    renderModule();
    fireEvent.click(screen.getByRole('button', { name: /Оживить описание/ }));
    expect(await screen.findByText(/Дым стелется над столами\./)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Переписать описание/ })).toBeInTheDocument();
    expect(fetchMock).toHaveBeenCalledTimes(1);
  });

  it('shows a friendly message in the block when the free quota is exhausted', async () => {
    seedState();
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
    renderModule();
    fireEvent.click(screen.getByRole('button', { name: /Оживить описание/ }));
    expect(await screen.findByText(/Бесплатные генерации закончились/)).toBeInTheDocument();
  });
});
