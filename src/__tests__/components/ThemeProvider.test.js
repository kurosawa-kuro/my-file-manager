import { render } from '@testing-library/react';
import Theme from '../../components/ThemeProvider';

// next-themesのThemeProviderをモック
jest.mock('next-themes', () => ({
  ThemeProvider: ({ children, attribute, disableTransitionOnChange }) => (
    <div 
      data-testid="next-themes-provider"
      data-attribute={attribute}
      data-disable-transition={disableTransitionOnChange}
    >
      {children}
    </div>
  )
}));

describe('ThemeProvider', () => {
  it('renders next-themes ThemeProvider with correct props', () => {
    const { getByTestId } = render(
      <Theme>
        <div>Test content</div>
      </Theme>
    );

    const provider = getByTestId('next-themes-provider');
    expect(provider).toBeInTheDocument();
    expect(provider).toHaveAttribute('data-attribute', 'class');
    expect(provider).toHaveAttribute('data-disable-transition', 'true');
  });

  it('renders children content', () => {
    const { getByText } = render(
      <Theme>
        <div>Test content</div>
      </Theme>
    );

    expect(getByText('Test content')).toBeInTheDocument();
  });

  it('passes children to next-themes ThemeProvider', () => {
    const { getByTestId } = render(
      <Theme>
        <div data-testid="child-content">Child content</div>
      </Theme>
    );

    const provider = getByTestId('next-themes-provider');
    const child = getByTestId('child-content');
    
    expect(provider).toContainElement(child);
  });

  it('maintains proper component structure', () => {
    const { container } = render(
      <Theme>
        <div>Test content</div>
      </Theme>
    );

    const themeComponent = container.firstChild;
    expect(themeComponent).toHaveAttribute('data-testid', 'next-themes-provider');
  });
}); 