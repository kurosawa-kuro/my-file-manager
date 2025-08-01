import { render } from '@testing-library/react';
import RootLayout from '../../app/layout';

// Next.jsのメタデータをモック
jest.mock('next/font/google', () => ({
  Geist: () => ({
    variable: '--font-geist-sans',
    style: { fontFamily: 'Geist' }
  }),
  Geist_Mono: () => ({
    variable: '--font-geist-mono',
    style: { fontFamily: 'Geist Mono' }
  })
}));

// ThemeProviderをモック
jest.mock('../../components/ThemeProvider', () => {
  return function MockThemeProvider({ children }) {
    return <div data-testid="theme-provider">{children}</div>;
  };
});

describe('RootLayout', () => {
  it('renders with correct HTML structure', () => {
    const { container } = render(
      <RootLayout>
        <div>Test content</div>
      </RootLayout>
    );

    const html = container.querySelector('html');
    const body = container.querySelector('body');

    expect(html).toBeInTheDocument();
    expect(html).toHaveAttribute('lang', 'ja');
    expect(html).toHaveAttribute('suppressHydrationWarning');
    expect(body).toBeInTheDocument();
  });

  it('applies correct CSS classes to body', () => {
    const { container } = render(
      <RootLayout>
        <div>Test content</div>
      </RootLayout>
    );

    const body = container.querySelector('body');
    expect(body).toHaveClass('--font-geist-sans');
    expect(body).toHaveClass('--font-geist-mono');
    expect(body).toHaveClass('antialiased');
  });

  it('renders ThemeProvider wrapper', () => {
    const { getByTestId } = render(
      <RootLayout>
        <div>Test content</div>
      </RootLayout>
    );

    expect(getByTestId('theme-provider')).toBeInTheDocument();
  });

  it('renders children content', () => {
    const { getByText } = render(
      <RootLayout>
        <div>Test content</div>
      </RootLayout>
    );

    expect(getByText('Test content')).toBeInTheDocument();
  });

  it('exports correct metadata', () => {
    const { metadata } = require('../../app/layout');
    
    expect(metadata).toEqual({
      title: "Video File Manager",
      description: "ローカル動画ファイルマネージャー"
    });
  });
}); 