import { render, screen } from '@testing-library/react';
import { ThemeProvider, Button, ToolCard, useTheme } from './index.js';

function ThemeProbe() {
  const { theme, accent } = useTheme();
  return <div data-testid="probe" data-theme={theme} data-accent={accent} />;
}

const sampleTool = {
  id: 'sample',
  name: 'Sample Tool',
  description: 'A sample module',
  group: 'creation',
  icon: 'wand',
  accent: '#c0563f',
  status: 'ready',
};

describe('design-system', () => {
  it('renders a Button and applies the default theme/accent', () => {
    render(
      <ThemeProvider>
        <Button>Click me</Button>
        <ThemeProbe />
      </ThemeProvider>
    );
    expect(screen.getByRole('button', { name: 'Click me' })).toBeInTheDocument();
    const probe = screen.getByTestId('probe');
    expect(probe).toHaveAttribute('data-theme', 'dark');
    expect(probe).toHaveAttribute('data-accent', 'gold');
    expect(document.documentElement).toHaveAttribute('data-theme', 'dark');
  });

  it('renders a ToolCard with its name, description and status tag', () => {
    render(
      <ThemeProvider>
        <ToolCard tool={sampleTool} variant="feature" groupLabel="Создание" />
      </ThemeProvider>
    );
    expect(screen.getByText('Sample Tool')).toBeInTheDocument();
    expect(screen.getByText('A sample module')).toBeInTheDocument();
    expect(screen.getByText('Готов')).toBeInTheDocument();
  });
});
