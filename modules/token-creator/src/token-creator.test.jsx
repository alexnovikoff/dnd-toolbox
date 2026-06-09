import { render, screen } from '@testing-library/react';
import { ThemeProvider } from '@dnd/design-system';
import { manifest, Component } from './index.jsx';

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
