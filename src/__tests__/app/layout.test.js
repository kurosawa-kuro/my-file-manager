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

// ConfigProviderをモック
jest.mock('../../components/ConfigProvider', () => {
  return function MockConfigProvider({ children }) {
    return <div data-testid="config-provider">{children}</div>;
  };
});

describe('RootLayout', () => {
  it('renders children content within providers', () => {
    const { getByText, getByTestId } = render(
      <RootLayout>
        <div>Test content</div>
      </RootLayout>
    );

    expect(getByTestId('config-provider')).toBeInTheDocument();
    expect(getByTestId('theme-provider')).toBeInTheDocument();
    expect(getByText('Test content')).toBeInTheDocument();
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