import { act, render, screen, fireEvent, within } from '@testing-library/react';
import { ThemeProvider } from '@dnd/design-system';
import { manifest, Component } from './index.jsx';
import { LOOT_DATA as D } from './data.js';

const e = (ru, en) => ({ ru, en });

const entry = (en) => D.items.find((i) => i.en === en);
const ITEM = {
  uid: 'item-1',
  entry: entry('Cloak of Protection'),
  variant: null,
  spell: null,
  mark: e('Пахнет дымом и яблоками.', 'Smells of smoke and apples.'),
};
const ITEM2 = {
  uid: 'item-2',
  entry: entry('Potion of Healing'),
  variant: null,
  spell: null,
  mark: e('На вкус как суп.', 'Tastes like soup.'),
};

// A fixed find seeded into localStorage keeps every assertion deterministic.
// None of these strings exist in the real tables, so a reroll always shows.
const HAUL = {
  id: 'haul-1',
  kind: 'hoard',
  tier: 't2',
  theme: 'martial',
  bounty: 'normal',
  bodies: 4,
  budget: { coins: 1000, gems: 300, art: 250, goods: 60 },
  coins: { gp: 1000 },
  gems: [{ gem: { ...e('гранат', 'garnet'), v: 100 }, n: 3, detail: null }],
  art: [{ ...e('Кубок-образец', 'A sample goblet'), v: 250 }],
  goods: [{ good: { ...e('Мешок-образец', 'A sample sack'), v: 1, lb: 20 }, n: 3 }],
  items: [ITEM, ITEM2],
  origin: {
    title: e('Казна вольного отряда-образца', 'The Sample Company’s Chest'),
    who: e('Наёмники спрятали жалованье.', 'The mercenaries hid their pay.'),
  },
  place: e('В образцовом колодце.', 'In a sample well.'),
  guard: e('Образцовый страж.', 'A sample guard.'),
  hook: e('Образцовое письмо.', 'A sample letter.'),
  ai: null,
};

const DEFAULTS = {
  params: { kind: 'hoard', tier: 't2', theme: 'any', bounty: 'normal', bodies: 4, party: 4 },
  lang: 'ru',
  locks: {},
  view: 'haul',
  haul: HAUL,
  saved: [],
  picks: [],
};

function seedState(overrides = {}) {
  localStorage.setItem('ddtb_loot', JSON.stringify({ ...DEFAULTS, ...overrides }));
}

const stored = () => JSON.parse(localStorage.getItem('ddtb_loot'));

function renderModule() {
  return render(
    <ThemeProvider>
      <Component />
    </ThemeProvider>
  );
}

vi.setConfig({ testTimeout: 20000 });
const byRole = { hidden: true };
const button = (name) => screen.getByRole('button', { name, ...byRole });
const queryButton = (name) => screen.queryByRole('button', { name, ...byRole });
const textbox = (name) => screen.getByRole('textbox', { name, ...byRole });
const click = (name) => fireEvent.click(button(name));
const AI = /Оживить с ИИ/;
const TITLE = 'Казна вольного отряда-образца';
// Testing Library collapses the non-breaking space the app groups digits with.
const COINS = '1 000 зм';

const okReply = (fields, extra = {}) => ({
  ok: true,
  status: 200,
  json: async () => ({ fields, ...extra }),
});

function stubReply(
  fields = {
    read: 'Сундук приоткрыт.',
    hook: 'Письмо адресовано вам.',
    marks: ['Первая', 'Вторая'],
  },
  extra
) {
  const fetchMock = vi.fn(async () => okReply(fields, extra));
  vi.stubGlobal('fetch', fetchMock);
  return fetchMock;
}

async function confirmAi() {
  click(AI);
  await act(async () => {
    click('Да');
  });
}

describe('loot-generator', () => {
  afterEach(() => {
    vi.unstubAllGlobals();
    localStorage.clear();
  });

  it('exposes a well-formed manifest', () => {
    expect(manifest).toMatchObject({
      id: 'loot',
      group: 'creation',
      icon: 'loot',
      accent: '#c9a84c',
      status: 'ready',
    });
  });

  describe('main roll', () => {
    it('starts empty, with no AI button until there is a find', () => {
      renderModule();
      expect(screen.getByText(/Сундук пока пуст/)).toBeInTheDocument();
      expect(queryButton(AI)).not.toBeInTheDocument();
    });

    it('rolls from the tables with no server call, then offers the AI button', () => {
      const fetchMock = stubReply();
      renderModule();
      click(/Создать клад/);
      expect(screen.getByText('История')).toBeInTheDocument();
      expect(button(AI)).toBeInTheDocument();
      expect(fetchMock).not.toHaveBeenCalled();
    });

    it('restores the find from the saved state', () => {
      seedState();
      renderModule();
      expect(screen.getByText(TITLE)).toBeInTheDocument();
      expect(screen.getByText(COINS)).toBeInTheDocument();
    });

    it('shows the sums a party asks about first', () => {
      seedState();
      renderModule();
      expect(screen.getByText('Всего')).toBeInTheDocument();
      expect(screen.getByText('На каждого из 4')).toBeInTheDocument();
      expect(screen.getByText('Вес')).toBeInTheDocument();
      expect(screen.getByText('Предметов')).toBeInTheDocument();
    });

    it('recomputes the share when the party size changes, without rerolling', () => {
      seedState({ params: { ...DEFAULTS.params, party: 5 } });
      renderModule();
      expect(screen.getByText('На каждого из 5')).toBeInTheDocument();
      expect(screen.getByText(TITLE)).toBeInTheDocument();
    });

    it('offers a button that matches the kind of find', () => {
      seedState({ haul: null });
      renderModule();
      click('Логово дракона');
      expect(button(/Создать логово/)).toBeInTheDocument();
      click('Награда за квест');
      expect(button(/Создать награду/)).toBeInTheDocument();
      click('С тел');
      expect(button(/Обыскать тела/)).toBeInTheDocument();
    });

    it('asks about the party level for a reward and CR otherwise', () => {
      seedState({ haul: null });
      renderModule();
      expect(screen.getByText('Опасность (CR)')).toBeInTheDocument();
      click('Награда за квест');
      expect(screen.getByText('Уровень партии')).toBeInTheDocument();
      expect(button('17–20')).toBeInTheDocument();
    });

    it('asks for a theme only where one applies', () => {
      seedState({ haul: null });
      renderModule();
      expect(screen.getByText('Тема')).toBeInTheDocument();
      click('Логово дракона');
      expect(screen.getByText('Тема')).toBeInTheDocument();
      click('С тел');
      expect(screen.queryByText('Тема')).not.toBeInTheDocument();
    });

    it('rolls bodies with coins and finds, and no AI button', () => {
      const fetchMock = stubReply();
      seedState({ haul: null });
      renderModule();
      click('С тел');
      click(/Обыскать тела/);
      expect(screen.getByText('Находки')).toBeInTheDocument();
      expect(screen.queryByText('Магические предметы')).not.toBeInTheDocument();
      expect(queryButton(AI)).not.toBeInTheDocument();
      expect(fetchMock).not.toHaveBeenCalled();
    });

    it('shows reward terms under their own heading', () => {
      seedState({ haul: null });
      renderModule();
      click('Награда за квест');
      click(/Создать награду/);
      expect(screen.getByText('Условия')).toBeInTheDocument();
      expect(screen.getByText('Кто платит')).toBeInTheDocument();
      expect(screen.getByText('Подвох')).toBeInTheDocument();
    });

    it('does not reroll the find when a filter changes', () => {
      seedState();
      renderModule();
      click('Реликварный');
      expect(screen.getByText(TITLE)).toBeInTheDocument();
      expect(stored().params.theme).toBe('relic');
    });

    it('shows the licence notice for the SRD material', () => {
      renderModule();
      expect(screen.getByText(/System Reference Document 5\.2\.1/)).toBeInTheDocument();
    });
  });

  describe('AI confirmation', () => {
    it('asks Да/Нет before anything is sent', () => {
      const fetchMock = stubReply();
      seedState();
      renderModule();
      click(AI);
      expect(screen.getByText(/Оживить эту добычу с помощью ИИ\?/)).toBeInTheDocument();
      expect(button('Да')).toBeInTheDocument();
      expect(button('Нет')).toBeInTheDocument();
      expect(fetchMock).not.toHaveBeenCalled();
    });

    it('closes on «Нет» without a request', () => {
      const fetchMock = stubReply();
      seedState();
      renderModule();
      click(AI);
      click('Нет');
      expect(queryButton('Да')).not.toBeInTheDocument();
      expect(button(AI)).toBeInTheDocument();
      expect(fetchMock).not.toHaveBeenCalled();
    });

    it('closes on Escape without a request', () => {
      const fetchMock = stubReply();
      seedState();
      renderModule();
      click(AI);
      fireEvent.keyDown(textbox(/Подсказка/), { key: 'Escape' });
      expect(queryButton('Да')).not.toBeInTheDocument();
      expect(fetchMock).not.toHaveBeenCalled();
    });

    it('sends parameters only after «Да» and shows the answer on the card', async () => {
      const fetchMock = stubReply();
      seedState();
      renderModule();
      await confirmAi();

      expect(fetchMock).toHaveBeenCalledTimes(1);
      const [url, opts] = fetchMock.mock.calls[0];
      const body = JSON.parse(opts.body);
      expect(url).toBe('/api/generate');
      expect(body).toMatchObject({ mode: 'loot_enliven', kind: 'hoard', lang: 'ru', keep: [] });
      expect(body.facts.title).toBe(TITLE);
      expect(body.facts.items).toHaveLength(2);
      // the client must never send a key or raw model/messages
      expect(body).not.toHaveProperty('messages');
      expect(body).not.toHaveProperty('model');
      expect(body).not.toHaveProperty('prompt');

      expect(await screen.findByText('Сундук приоткрыт.')).toBeInTheDocument();
      expect(screen.getByText('Письмо адресовано вам.')).toBeInTheDocument();
      expect(screen.getByText('Первая')).toBeInTheDocument();
      expect(screen.queryByText('Образцовое письмо.')).not.toBeInTheDocument();
    });

    it('never rewrites the treasure itself', async () => {
      stubReply({ read: 'x', coins: '1 зм', gems: ['ничего'], title: 'Другое' });
      seedState();
      renderModule();
      await confirmAi();
      expect(screen.getByText(TITLE)).toBeInTheDocument();
      expect(screen.getByText(COINS)).toBeInTheDocument();
      expect(screen.getByText('3 × гранат (по 100 зм)')).toBeInTheDocument();
    });

    it('passes the optional hint along', async () => {
      const fetchMock = stubReply();
      seedState();
      renderModule();
      click(AI);
      fireEvent.change(textbox(/Подсказка/), { target: { value: 'это склад культа' } });
      await act(async () => {
        click('Да');
      });
      expect(JSON.parse(fetchMock.mock.calls[0][1].body).hint).toBe('это склад культа');
    });

    it('asks again before every further run', async () => {
      const fetchMock = stubReply();
      seedState();
      renderModule();
      await confirmAi();
      click(/Оживить заново/);
      expect(button('Да')).toBeInTheDocument();
      expect(fetchMock).toHaveBeenCalledTimes(1);
    });

    it('sends locked lines as «keep» and leaves them as they were', async () => {
      const fetchMock = stubReply({
        read: 'x',
        hook: 'Письмо адресовано вам.',
        place: 'В пещере.',
      });
      seedState({ locks: { hook: true } });
      renderModule();
      await confirmAi();
      expect(JSON.parse(fetchMock.mock.calls[0][1].body).keep).toEqual(['hook']);
      expect(screen.getByText('Образцовое письмо.')).toBeInTheDocument();
      expect(screen.getByText('В пещере.')).toBeInTheDocument();
    });

    it('puts the table draft back on «Вернуть таблицы»', async () => {
      const fetchMock = stubReply();
      seedState();
      renderModule();
      await confirmAi();
      click(/Вернуть таблицы/);
      expect(screen.getByText('Образцовое письмо.')).toBeInTheDocument();
      expect(screen.queryByText('Сундук приоткрыт.')).not.toBeInTheDocument();
      expect(fetchMock).toHaveBeenCalledTimes(1);
    });

    it('does not apply a late answer to a find rolled in the meantime', async () => {
      let resolve;
      vi.stubGlobal(
        'fetch',
        vi.fn(
          () =>
            new Promise((r) => {
              resolve = r;
            })
        )
      );
      seedState();
      renderModule();
      click(AI);
      click('Да');
      click(/Создать клад/);
      await act(async () => {
        resolve(okReply({ read: 'Сундук приоткрыт.' }));
      });
      expect(screen.queryByText('Сундук приоткрыт.')).not.toBeInTheDocument();
    });

    it('applies a late answer to the saved copy of the find it was asked for', async () => {
      let resolve;
      vi.stubGlobal(
        'fetch',
        vi.fn(
          () =>
            new Promise((r) => {
              resolve = r;
            })
        )
      );
      seedState({ saved: [HAUL] });
      renderModule();
      click(AI);
      click('Да');
      click(/Создать клад/);
      await act(async () => {
        resolve(okReply({ read: 'Сундук приоткрыт.' }));
      });
      expect(stored().saved[0].ai.read.text).toBe('Сундук приоткрыт.');
    });

    it('shows a friendly message when the free quota is exhausted', async () => {
      vi.stubGlobal(
        'fetch',
        vi.fn(async () => ({
          ok: false,
          status: 402,
          json: async () => ({ error: 'x', code: 'free_quota_exhausted', remaining: 0 }),
        }))
      );
      seedState();
      renderModule();
      await confirmAi();
      expect(await screen.findByRole('alert')).toHaveTextContent(
        /Бесплатные генерации закончились/
      );
      expect(screen.getByText('Образцовое письмо.')).toBeInTheDocument();
    });

    it('treats an answer with no usable fields as a failure', async () => {
      stubReply({ nonsense: 'x' });
      seedState();
      renderModule();
      await confirmAi();
      expect(await screen.findByRole('alert')).toHaveTextContent(/Не удалось получить ответ/);
    });

    it('sends the stored user key as a header and says so in the question', async () => {
      localStorage.setItem('ddtb_user_key', 'sk-ant-test-123456');
      const fetchMock = stubReply();
      seedState();
      renderModule();
      click(AI);
      expect(screen.getByText(/через ваш API-ключ/)).toBeInTheDocument();
      await act(async () => {
        click('Да');
      });
      const opts = fetchMock.mock.calls[0][1];
      expect(opts.headers['x-user-api-key']).toBe('sk-ant-test-123456');
      expect(opts.body).not.toContain('sk-ant-test-123456');
    });
  });

  describe('card', () => {
    it('switches language instantly without rerolling', () => {
      seedState();
      renderModule();
      click('ENG');
      expect(screen.getByText('The Sample Company’s Chest')).toBeInTheDocument();
      expect(screen.getByText('A sample letter.')).toBeInTheDocument();
      click('РУС');
      expect(screen.getByText(TITLE)).toBeInTheDocument();
    });

    it('keeps AI text in its own language and says where it went', () => {
      seedState({ haul: { ...HAUL, ai: { hook: { text: 'Письмо вам.', lang: 'ru' } } } });
      renderModule();
      expect(screen.getByText('Письмо вам.')).toBeInTheDocument();
      click('ENG');
      expect(screen.queryByText('Письмо вам.')).not.toBeInTheDocument();
      expect(screen.getByText('A sample letter.')).toBeInTheDocument();
      expect(screen.getByText(/written in another language/)).toBeInTheDocument();
    });

    it('shows what an item is, what it does and how it is marked', () => {
      seedState();
      renderModule();
      expect(screen.getByText('Плащ защиты')).toBeInTheDocument();
      expect(screen.getByText(/необычный · настройка/)).toBeInTheDocument();
      expect(screen.getByText('+1 к КД и спасброскам.')).toBeInTheDocument();
      expect(screen.getByText('Пахнет дымом и яблоками.')).toBeInTheDocument();
    });

    it('rerolls exactly one section', () => {
      seedState();
      renderModule();
      click('Перебросить: Где лежит');
      expect(screen.queryByText('В образцовом колодце.')).not.toBeInTheDocument();
      expect(screen.getByText('Образцовое письмо.')).toBeInTheDocument();
      expect(screen.getByText(TITLE)).toBeInTheDocument();
    });

    it('rerolls exactly one item', () => {
      seedState();
      renderModule();
      click('Перебросить: Плащ защиты');
      expect(screen.queryByText('Плащ защиты')).not.toBeInTheDocument();
      expect(screen.getByText('Зелье лечения')).toBeInTheDocument();
      expect(stored().haul.items[0].entry.r).toBe('u');
    });

    it('renames the find along with whoever gathered it', () => {
      seedState();
      renderModule();
      click('Перебросить: Кто собрал');
      expect(screen.queryByText(TITLE)).not.toBeInTheDocument();
      expect(screen.queryByText('Наёмники спрятали жалованье.')).not.toBeInTheDocument();
    });

    it('keeps a locked line through a new roll and blocks its reroll', () => {
      seedState();
      renderModule();
      click('Закрепить: Где лежит');
      expect(button('Перебросить: Где лежит')).toBeDisabled();
      click(/Создать клад/);
      expect(screen.getByText('В образцовом колодце.')).toBeInTheDocument();
      expect(screen.queryByText('Образцовое письмо.')).not.toBeInTheDocument();
      expect(button('Открепить: Где лежит')).toBeInTheDocument();
    });

    it('keeps a locked item through a new roll', () => {
      seedState();
      renderModule();
      click('Закрепить: Плащ защиты');
      click(/Создать клад/);
      expect(screen.getByText('Плащ защиты')).toBeInTheDocument();
      expect(button('Открепить: Плащ защиты')).toBeInTheDocument();
    });

    it('forgets the lock of an item that left the card', () => {
      seedState({ locks: { 'item:gone': true } });
      renderModule();
      click(/Создать клад/);
      expect(stored().locks).not.toHaveProperty('item:gone');
    });

    it('copies the find as text', async () => {
      const writeText = vi.fn(async () => {});
      vi.stubGlobal('navigator', { ...navigator, clipboard: { writeText } });
      seedState();
      renderModule();
      await act(async () => {
        click(/^Копировать$/);
      });
      expect(writeText.mock.calls[0][0]).toContain(TITLE);
      expect(writeText.mock.calls[0][0]).toContain('Где лежит: В образцовом колодце.');
      expect(writeText.mock.calls[0][0]).toContain('Плащ защиты');
      expect(button(/Скопировано/)).toBeInTheDocument();
    });
  });

  describe('quick rolls', () => {
    it('rolls single things locally and piles them up, newest first', () => {
      const fetchMock = stubReply();
      seedState({ haul: null, view: 'quick' });
      renderModule();
      expect(screen.getByText(/Здесь появятся броски/)).toBeInTheDocument();
      click('Бросить: Безделушка');
      click('Бросить: Зелье');
      const picks = stored().picks;
      expect(picks).toHaveLength(2);
      expect(picks[0].type).toBe('potion');
      expect(picks[1].type).toBe('trinket');
      expect(fetchMock).not.toHaveBeenCalled();
    });

    it('keeps only the settings a single roll can use', () => {
      seedState({ haul: null, view: 'quick' });
      renderModule();
      expect(screen.getByText('Опасность (CR)')).toBeInTheDocument();
      expect(screen.queryByText('Вид добычи')).not.toBeInTheDocument();
      expect(queryButton(/Создать клад/)).not.toBeInTheDocument();
    });

    it('disables a row with no matching items', () => {
      seedState({
        haul: null,
        view: 'quick',
        quickOpts: { itemRarity: 'c', itemCat: 'ring' },
      });
      renderModule();
      expect(button('Бросить: Предмет')).toBeDisabled();
    });

    it('removes one roll and clears the rest', () => {
      seedState({
        haul: null,
        view: 'quick',
        picks: [
          { id: 'a', type: 'trinket', entry: e('Брелок-образец', 'Sample charm') },
          { id: 'b', type: 'trinket', entry: e('Кулон-образец', 'Sample pendant') },
        ],
      });
      renderModule();
      click('Убрать: Брелок-образец');
      expect(screen.queryByText('Брелок-образец')).not.toBeInTheDocument();
      expect(screen.getByText('Кулон-образец')).toBeInTheDocument();
      click('Очистить');
      expect(stored().picks).toEqual([]);
    });

    it('keeps the list buttons above the rolls', () => {
      seedState({
        haul: null,
        view: 'quick',
        picks: [{ id: 'a', type: 'trinket', entry: e('Брелок-образец', 'Sample charm') }],
      });
      renderModule();
      const roll = screen.getByText('Брелок-образец');
      for (const name of ['Копировать всё', 'Очистить']) {
        const position = button(name).compareDocumentPosition(roll);
        expect(position & Node.DOCUMENT_POSITION_FOLLOWING).toBeTruthy();
      }
    });
  });

  describe('my finds', () => {
    it('saves the find, lists it and survives a new roll', () => {
      seedState();
      renderModule();
      click(/В мои клады/);
      expect(button(/Сохранено/)).toBeDisabled();
      click(/Создать клад/);
      expect(screen.queryByText(TITLE)).not.toBeInTheDocument();
      click('Мои клады · 1');
      expect(screen.getByText(TITLE)).toBeInTheDocument();
    });

    it('offers notes only for a saved find and keeps them in the list', () => {
      seedState();
      renderModule();
      expect(screen.queryByRole('textbox', { name: /Заметки/, ...byRole })).not.toBeInTheDocument();
      click(/В мои клады/);
      fireEvent.change(textbox(/Заметки/), { target: { value: 'Плащ забрала воровка' } });
      expect(stored().saved[0].notes).toBe('Плащ забрала воровка');
    });

    it('opens a saved find on the card', () => {
      seedState({ haul: null, saved: [HAUL], view: 'saved' });
      renderModule();
      click('Открыть');
      expect(screen.getByText('История')).toBeInTheDocument();
      expect(screen.getByText(TITLE)).toBeInTheDocument();
    });

    it('keeps edits made on the card in the saved copy', () => {
      seedState({ saved: [HAUL] });
      renderModule();
      click('Перебросить: Где лежит');
      expect(stored().saved[0].place).not.toEqual(HAUL.place);
    });

    it('deletes only after Да', () => {
      seedState({ haul: null, saved: [HAUL], view: 'saved' });
      renderModule();
      click(`Удалить: ${TITLE}`);
      const row = screen.getByText('Удалить?').parentElement;
      fireEvent.click(within(row).getByRole('button', { name: 'Нет' }));
      expect(screen.getByText(TITLE)).toBeInTheDocument();
      click(`Удалить: ${TITLE}`);
      fireEvent.click(
        within(screen.getByText('Удалить?').parentElement).getByRole('button', { name: 'Да' })
      );
      expect(screen.queryByText(TITLE)).not.toBeInTheDocument();
      expect(stored().saved).toEqual([]);
    });
  });
});
