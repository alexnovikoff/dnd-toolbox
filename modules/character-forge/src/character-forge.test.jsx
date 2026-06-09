import { render, screen, fireEvent } from '@testing-library/react';
import { ThemeProvider } from '@dnd/design-system';
import { manifest, Component } from './index.jsx';

const FIELDS = {
  backstory: 'A quiet life upended by fire.',
  personality: 'Wry and watchful.',
  goals: 'Find the missing ledger.',
  flaws: 'Trusts no one.',
  secret_desire: 'To be forgiven.',
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
      json: async () => ({ fields: FIELDS }),
    };
  });
  vi.stubGlobal('fetch', fetchMock);
  return fetchMock;
}

describe('character-forge', () => {
  afterEach(() => {
    vi.unstubAllGlobals();
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

    fireEvent.change(screen.getByPlaceholderText('Kael Duskmantle'), {
      target: { value: 'Kael Duskmantle' },
    });
    fireEvent.click(screen.getByRole('button', { name: /Создать персонажа/ }));

    expect(await screen.findByText(FIELDS.backstory)).toBeInTheDocument();
    expect(screen.getByText(FIELDS.secret_desire)).toBeInTheDocument();
    expect(fetchMock).toHaveBeenCalledTimes(1);
  });
});
