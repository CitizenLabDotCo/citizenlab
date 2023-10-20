import React, { FC } from 'react';
import { render, RenderOptions } from '@testing-library/react';
import { ThemeProvider } from 'styled-components';
import { getTheme } from '../../utils/styleUtils';
import GlobalStyle from '../../global-styles';

const AllTheProviders: FC = ({ children }) => {
  return (
    <ThemeProvider theme={getTheme(null)}>
      <GlobalStyle />
      {children}
    </ThemeProvider>
  );
};

const customRender = (ui: React.ReactElement, options?: RenderOptions) =>
  render(ui, { wrapper: AllTheProviders, ...options });

// re-export everything
export * from '@testing-library/react';

// override render method
export { customRender as render };
