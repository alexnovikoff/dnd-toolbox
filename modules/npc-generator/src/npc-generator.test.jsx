import { act, render, screen, fireEvent, within } from '@testing-library/react';
import { ThemeProvider } from '@dnd/design-system';
import { manifest, Component } from './index.jsx';

const e = (ru, en) => ({ ru, en });

// A fixed NPC seeded into localStorage keeps every assertion deterministic.
// None of these strings exist in the real tables, so a reroll always shows.
const NPC = {
  id: 'npc-1',
  level: 'key',
  who: { race: { id: 'human', ru: 'человек', en: 'human' }, gender: 'm', age: 50 },
  name: e('Бранд Дубовик', 'Brand Oakley'),
  occupation: { ru: 'сборщи{к|ца} пошлины', en: 'toll collector', c: 'law', stat: 'commoner' },
  feature: e('Печать на шнурке', 'A seal on a cord'),
  manner: e('Считает монеты вслух', 'Counts coins aloud'),
  mood: e('Настороженн{ый|ая}: отвечает коротко', 'Wary: gives short answers'),
  want: e('Закрыть дыру в кассе', 'Plug the hole in the till'),
  knows: [
    e('Кто провёз телегу', 'Who drove the cart'),
    e('Где ночует беглец', 'Where the fugitive sleeps'),
    e('Какая дверь открыта', 'Which door stays open'),
  ],
  secret: e('Живёт чужой жизнью', 'Lives someone else’s life'),
  lever: e('Трясётся за сестру', 'Shakes for their sister'),
  background: e('Служил{|а} в канцелярии', 'Worked in a chancery'),
  hook: e('Просит сжечь расписку', 'Asks to burn a receipt'),
  plan: e('Сожжёт контору', 'Burns the office'),
  offer: e('Лодку на рассвете', 'A boat at dawn'),
  talk: e('Лесть работает', 'Flattery does it'),
  ties: e('Долж{ен|на} мельнику', 'Owes the miller'),
  combat: { stat: 'commoner', tactic: e('Зовёт на помощь', 'Yells for help') },
  ai: null,
};

function seedState(overrides = {}) {
  localStorage.setItem(
    'ddtb_npc',
    JSON.stringify({
      params: { level: 'key', occ: 'any', race: 'any', gender: 'any', tone: 'any' },
      lang: 'ru',
      locks: {},
      view: 'npc',
      crowdSize: 5,
      npc: NPC,
      crowd: [],
      saved: [],
      ...overrides,
    })
  );
}

// One passer-by waiting in the crowd list.
const CROWD_NPC = { ...NPC, id: 'crowd-1', level: 'passerby' };

function seedCrowd(overrides = {}) {
  seedState({
    params: { level: 'passerby', occ: 'any', race: 'any', gender: 'any', tone: 'any' },
    npc: null,
    crowd: [CROWD_NPC],
    view: 'crowd',
    ...overrides,
  });
}

function renderModule() {
  return render(
    <ThemeProvider>
      <Component />
    </ThemeProvider>
  );
}

// A key-level card holds dozens of buttons, and role queries walk computed
// styles for each one. `hidden: true` skips that walk (nothing here is hidden),
// and the longer timeout covers CI machines running every test file at once.
vi.setConfig({ testTimeout: 20000 });
const byRole = { hidden: true };
const button = (name) => screen.getByRole('button', { name, ...byRole });
const queryButton = (name) => screen.queryByRole('button', { name, ...byRole });
const textbox = (name) => screen.getByRole('textbox', { name, ...byRole });
const click = (name) => fireEvent.click(button(name));
const AI = /Углубить с ИИ/;

const okReply = (fields, extra = {}) => ({
  ok: true,
  status: 200,
  json: async () => ({ fields, ...extra }),
});

function stubReply(fields = { quote: 'Плати или проваливай', want: 'Сбежать до зимы' }, extra) {
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

describe('npc-generator', () => {
  afterEach(() => {
    vi.unstubAllGlobals();
    localStorage.clear();
  });

  it('exposes a well-formed manifest', () => {
    expect(manifest).toMatchObject({
      id: 'npc',
      group: 'creation',
      icon: 'npc',
      accent: '#8a6cc0',
      status: 'ready',
    });
  });

  describe('main generation', () => {
    it('starts empty, with no AI button until an NPC exists', () => {
      renderModule();
      expect(screen.getByText(/Настройте параметры/)).toBeInTheDocument();
      expect(queryButton(AI)).not.toBeInTheDocument();
    });

    it('rolls from the tables with no server call, then offers the AI button', () => {
      const fetchMock = stubReply();
      renderModule();
      click(/Создать NPC/);
      expect(screen.getByText('Примета')).toBeInTheDocument();
      expect(button(AI)).toBeInTheDocument();
      expect(fetchMock).not.toHaveBeenCalled();
    });

    it('restores the NPC from the saved state', () => {
      seedState();
      renderModule();
      expect(screen.getByText('Бранд Дубовик')).toBeInTheDocument();
      expect(screen.getByText('сборщик пошлины')).toBeInTheDocument();
      expect(button(AI)).toBeInTheDocument();
    });

    it('agrees Russian text with the gender of the NPC', () => {
      seedState({ npc: { ...NPC, who: { ...NPC.who, gender: 'f' } } });
      renderModule();
      expect(screen.getByText('сборщица пошлины')).toBeInTheDocument();
      expect(screen.getByText('Настороженная: отвечает коротко')).toBeInTheDocument();
    });
  });

  describe('AI confirmation', () => {
    it('asks Да/Нет before anything is sent', () => {
      const fetchMock = stubReply();
      seedState();
      renderModule();
      click(AI);
      expect(screen.getByText(/Углубить этого NPC с помощью ИИ\?/)).toBeInTheDocument();
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
      expect(body).toMatchObject({
        mode: 'npc_deepen',
        level: 'key',
        lang: 'ru',
        gender: 'male',
        keep: [],
      });
      expect(body.facts.name).toBe('Бранд Дубовик');
      expect(body.facts.knows).toContain('; ');
      // the client must never send a key or raw model/messages
      expect(body).not.toHaveProperty('messages');
      expect(body).not.toHaveProperty('model');
      expect(body).not.toHaveProperty('prompt');

      expect(await screen.findByText(/Плати или проваливай/)).toBeInTheDocument();
      expect(screen.getByText('Сбежать до зимы')).toBeInTheDocument();
      expect(screen.queryByText('Закрыть дыру в кассе')).not.toBeInTheDocument();
    });

    it('passes the optional hint along', async () => {
      const fetchMock = stubReply();
      seedState();
      renderModule();
      click(AI);
      fireEvent.change(textbox(/Подсказка/), {
        target: { value: 'связан с контрабандистами' },
      });
      await act(async () => {
        click('Да');
      });
      expect(JSON.parse(fetchMock.mock.calls[0][1].body).hint).toBe('связан с контрабандистами');
    });

    it('asks again before every further run', async () => {
      const fetchMock = stubReply();
      seedState();
      renderModule();
      await confirmAi();
      click(/Углубить заново/);
      expect(button('Да')).toBeInTheDocument();
      expect(fetchMock).toHaveBeenCalledTimes(1);
    });

    it('sends locked fields as «keep» and leaves them as they were', async () => {
      const fetchMock = stubReply({ quote: 'Эй', want: 'Сбежать до зимы', manner: 'Икает' });
      seedState({ locks: { want: true } });
      renderModule();
      await confirmAi();
      expect(JSON.parse(fetchMock.mock.calls[0][1].body).keep).toEqual(['want']);
      expect(screen.getByText('Закрыть дыру в кассе')).toBeInTheDocument();
      expect(screen.getByText('Икает')).toBeInTheDocument();
    });

    it('puts the table draft back on «Вернуть таблицы»', async () => {
      const fetchMock = stubReply();
      seedState();
      renderModule();
      await confirmAi();
      click(/Вернуть таблицы/);
      expect(screen.getByText('Закрыть дыру в кассе')).toBeInTheDocument();
      expect(screen.queryByText(/Плати или проваливай/)).not.toBeInTheDocument();
      expect(fetchMock).toHaveBeenCalledTimes(1);
    });

    it('does not apply a late answer to an NPC rolled in the meantime', async () => {
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
      click(/Создать NPC/);
      await act(async () => {
        resolve(okReply({ quote: 'Плати или проваливай' }));
      });
      expect(screen.queryByText(/Плати или проваливай/)).not.toBeInTheDocument();
    });

    it('applies a late answer to the saved copy of the NPC it was asked for', async () => {
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
      seedState({ saved: [NPC] });
      renderModule();
      click(AI);
      click('Да');
      click(/Создать NPC/);
      await act(async () => {
        resolve(okReply({ quote: 'Плати или проваливай' }));
      });
      const stored = JSON.parse(localStorage.getItem('ddtb_npc'));
      expect(stored.saved[0].ai.quote.text).toBe('Плати или проваливай');
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
      expect(screen.getByText('Закрыть дыру в кассе')).toBeInTheDocument();
    });

    it('treats an answer with no usable fields as a failure', async () => {
      stubReply({ nonsense: 'x' });
      seedState();
      renderModule();
      await confirmAi();
      expect(await screen.findByRole('alert')).toHaveTextContent(/Не удалось получить ответ/);
    });

    it('mentions the free tier in the question and the balance once it is known', async () => {
      stubReply(undefined, { remaining: 7 });
      seedState();
      renderModule();
      click(AI);
      expect(screen.getByText(/одну бесплатную генерацию/)).toBeInTheDocument();
      await act(async () => {
        click('Да');
      });
      click(/Углубить заново/);
      expect(screen.getByText(/осталось 7/)).toBeInTheDocument();
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
    it('reveals the deeper fields when the level rises, without rerolling', () => {
      seedState({
        params: { level: 'passerby', occ: 'any', race: 'any', gender: 'any', tone: 'any' },
        npc: { ...NPC, level: 'passerby' },
      });
      renderModule();
      expect(screen.queryByText('Зацепка')).not.toBeInTheDocument();
      expect(screen.queryByText('В бою')).not.toBeInTheDocument();
      click('Ключевой');
      expect(screen.getByText('Зацепка')).toBeInTheDocument();
      expect(screen.getByText('В бою')).toBeInTheDocument();
      expect(screen.getByText('Бранд Дубовик')).toBeInTheDocument();
      expect(screen.getByText('Закрыть дыру в кассе')).toBeInTheDocument();
    });

    it('switches language instantly without rerolling', () => {
      seedState();
      renderModule();
      click('ENG');
      expect(screen.getByText('Brand Oakley')).toBeInTheDocument();
      expect(screen.getByText('Plug the hole in the till')).toBeInTheDocument();
      click('РУС');
      expect(screen.getByText('Бранд Дубовик')).toBeInTheDocument();
    });

    it('keeps AI text in its own language and says where it went', () => {
      seedState({ npc: { ...NPC, ai: { want: { text: 'Сбежать до зимы', lang: 'ru' } } } });
      renderModule();
      expect(screen.getByText('Сбежать до зимы')).toBeInTheDocument();
      click('ENG');
      expect(screen.queryByText('Сбежать до зимы')).not.toBeInTheDocument();
      expect(screen.getByText('Plug the hole in the till')).toBeInTheDocument();
      expect(screen.getByText(/written in another language/)).toBeInTheDocument();
    });

    it('shows the secret right away', () => {
      seedState();
      renderModule();
      expect(screen.getByText('Живёт чужой жизнью')).toBeInTheDocument();
      expect(queryButton('Показать')).not.toBeInTheDocument();
      expect(queryButton('Скрыть')).not.toBeInTheDocument();
    });

    it('rerolls exactly one field', () => {
      seedState();
      renderModule();
      click('Перебросить: Примета');
      expect(screen.queryByText('Печать на шнурке')).not.toBeInTheDocument();
      expect(screen.getByText('Считает монеты вслух')).toBeInTheDocument();
      expect(screen.getByText('Бранд Дубовик')).toBeInTheDocument();
    });

    it('keeps a locked field through «Создать NPC» and blocks its reroll', () => {
      seedState();
      renderModule();
      click('Закрепить: Примета');
      expect(button('Перебросить: Примета')).toBeDisabled();
      click(/Создать NPC/);
      expect(screen.getByText('Печать на шнурке')).toBeInTheDocument();
      expect(screen.queryByText('Считает монеты вслух')).not.toBeInTheDocument();
      expect(button('Открепить: Примета')).toBeInTheDocument();
    });

    it('does not reroll the NPC when a filter changes', () => {
      seedState();
      renderModule();
      click('Мрачный');
      expect(screen.getByText('Бранд Дубовик')).toBeInTheDocument();
      expect(JSON.parse(localStorage.getItem('ddtb_npc')).params.tone).toBe('grim');
    });

    it('offers a mystic tone', () => {
      seedState();
      renderModule();
      click('Мистический');
      expect(JSON.parse(localStorage.getItem('ddtb_npc')).params.tone).toBe('mystic');
    });

    it('copies the card as text', async () => {
      const writeText = vi.fn(async () => {});
      vi.stubGlobal('navigator', { ...navigator, clipboard: { writeText } });
      seedState();
      renderModule();
      await act(async () => {
        click(/Копировать/);
      });
      expect(writeText.mock.calls[0][0]).toContain('Бранд Дубовик');
      expect(writeText.mock.calls[0][0]).toContain('Зацепка: Просит сжечь расписку');
      expect(button(/Скопировано/)).toBeInTheDocument();
    });
  });

  describe('crowd', () => {
    it('rolls several passers-by and opens one on the card', () => {
      const fetchMock = stubReply();
      renderModule();
      click('Толпа');
      expect(queryButton(AI)).not.toBeInTheDocument();
      click(/Создать толпу/);
      const open = screen.getAllByRole('button', { name: 'Открыть', ...byRole });
      expect(open).toHaveLength(5);
      expect(queryButton(AI)).not.toBeInTheDocument();
      fireEvent.click(open[0]);
      expect(screen.getByText('Примета')).toBeInTheDocument();
      expect(button(AI)).toBeInTheDocument();
      expect(fetchMock).not.toHaveBeenCalled();
    });

    it('goes back to the list from an opened NPC', () => {
      seedCrowd();
      renderModule();
      click('Открыть');
      expect(screen.getByText('Примета')).toBeInTheDocument();
      click('Назад');
      expect(button('Открыть')).toBeInTheDocument();
      expect(screen.queryByText('Примета')).not.toBeInTheDocument();
    });

    it('offers «Назад» only for an NPC from the crowd', () => {
      seedState();
      renderModule();
      expect(queryButton('Назад')).not.toBeInTheDocument();
    });

    it('drops «Назад» once a new NPC is rolled', () => {
      seedCrowd();
      renderModule();
      click('Открыть');
      click(/Создать NPC/);
      expect(queryButton('Назад')).not.toBeInTheDocument();
    });

    it('keeps edits made on the card after going back', () => {
      seedCrowd();
      renderModule();
      click('Открыть');
      click('Перебросить: Примета');
      click('Назад');
      expect(screen.queryByText('Печать на шнурке')).not.toBeInTheDocument();
      click('Открыть');
      expect(screen.queryByText('Печать на шнурке')).not.toBeInTheDocument();
    });

    it('keeps the AI text after going back', async () => {
      stubReply();
      seedCrowd();
      renderModule();
      click('Открыть');
      await confirmAi();
      click('Назад');
      click('Открыть');
      expect(screen.getByText(/Плати или проваливай/)).toBeInTheDocument();
    });

    it('builds the full form from a crowd NPC and keeps what was filled', () => {
      const fetchMock = stubReply();
      seedCrowd();
      renderModule();
      click('Открыть');
      expect(screen.queryByText('Зацепка')).not.toBeInTheDocument();
      click('Сгенерировать полноценного');
      for (const label of ['Знает', 'Секрет', 'Зацепка', 'Если не вмешаться', 'В бою']) {
        expect(screen.getByText(label)).toBeInTheDocument();
      }
      for (const kept of [
        'Бранд Дубовик',
        'сборщик пошлины',
        'Печать на шнурке',
        'Считает монеты вслух',
        'Настороженный: отвечает коротко',
        'Закрыть дыру в кассе',
      ]) {
        expect(screen.getByText(kept)).toBeInTheDocument();
      }
      expect(queryButton('Сгенерировать полноценного')).not.toBeInTheDocument();
      expect(button('Назад')).toBeInTheDocument();
      expect(fetchMock).not.toHaveBeenCalled();
    });

    it('remembers the full form in the crowd and on the level selector', () => {
      seedCrowd();
      renderModule();
      click('Открыть');
      click('Сгенерировать полноценного');
      const stored = JSON.parse(localStorage.getItem('ddtb_npc'));
      expect(stored.crowd[0].level).toBe('key');
      expect(stored.params.level).toBe('key');
      click('Назад');
      expect(screen.getByText(/сборщик пошлины · Ключевой/)).toBeInTheDocument();
    });

    it('keeps locked fields when building the full form', () => {
      seedCrowd({ locks: { secret: true } });
      renderModule();
      click('Открыть');
      click('Сгенерировать полноценного');
      expect(screen.getByText('Живёт чужой жизнью')).toBeInTheDocument();
    });

    it('offers the full form only for a crowd NPC', () => {
      seedState({ npc: CROWD_NPC, crowd: [] });
      renderModule();
      expect(queryButton('Сгенерировать полноценного')).not.toBeInTheDocument();
    });

    it('does not offer the full form when the NPC already has it', () => {
      seedCrowd({ crowd: [{ ...CROWD_NPC, level: 'key' }] });
      renderModule();
      click('Открыть');
      expect(queryButton('Сгенерировать полноценного')).not.toBeInTheDocument();
      expect(button('Назад')).toBeInTheDocument();
    });
  });

  describe('my NPCs', () => {
    it('saves the NPC, lists it and survives a new roll', () => {
      seedState();
      renderModule();
      click(/В мои NPC/);
      expect(button(/Сохранено/)).toBeDisabled();
      click(/Создать NPC/);
      expect(screen.queryByText('Бранд Дубовик')).not.toBeInTheDocument();
      click('Мои NPC · 1');
      expect(screen.getByText('Бранд Дубовик')).toBeInTheDocument();
    });

    it('offers notes only for a saved NPC and keeps them in the list', () => {
      seedState();
      renderModule();
      expect(screen.queryByRole('textbox', { name: /Заметки/, ...byRole })).not.toBeInTheDocument();
      click(/В мои NPC/);
      fireEvent.change(textbox(/Заметки/), {
        target: { value: 'Партия обещала помочь' },
      });
      expect(JSON.parse(localStorage.getItem('ddtb_npc')).saved[0].notes).toBe(
        'Партия обещала помочь'
      );
    });

    it('opens a saved NPC on the card at its own level', () => {
      seedState({
        params: { level: 'passerby', occ: 'any', race: 'any', gender: 'any', tone: 'any' },
        npc: null,
        saved: [NPC],
        view: 'saved',
      });
      renderModule();
      click('Открыть');
      expect(screen.getByText('Зацепка')).toBeInTheDocument();
      // the level selector follows the NPC, not the previous roll
      expect(JSON.parse(localStorage.getItem('ddtb_npc')).params.level).toBe('key');
    });

    it('deletes only after Да', () => {
      seedState({ npc: null, saved: [NPC], view: 'saved' });
      renderModule();
      click('Удалить: Бранд Дубовик');
      const row = screen.getByText('Удалить?').parentElement;
      fireEvent.click(within(row).getByRole('button', { name: 'Нет' }));
      expect(screen.getByText('Бранд Дубовик')).toBeInTheDocument();
      click('Удалить: Бранд Дубовик');
      fireEvent.click(
        within(screen.getByText('Удалить?').parentElement).getByRole('button', { name: 'Да' })
      );
      expect(screen.queryByText('Бранд Дубовик')).not.toBeInTheDocument();
      expect(JSON.parse(localStorage.getItem('ddtb_npc')).saved).toEqual([]);
    });
  });
});
