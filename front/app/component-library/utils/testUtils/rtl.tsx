/* eslint-disable no-restricted-imports */
import React, { FC } from 'react';

import { render, RenderOptions } from '@testing-library/react';
import { HelmetProvider } from 'react-helmet-async';
import { ThemeProvider } from 'styled-components';

import GlobalStyle from '../../global-styles';
import { getTheme } from '../styleUtils';

const AllTheProviders: FC = ({ children }: { children?: React.ReactNode }) => {
  return (
    <HelmetProvider>
      <ThemeProvider theme={getTheme(null)}>
        <GlobalStyle />
        {children}
      </ThemeProvider>
    </HelmetProvider>
  );
};

const customRender = (ui: React.ReactElement, options?: RenderOptions) =>
  render(ui, { wrapper: AllTheProviders, ...options });

// re-export everything
export * from '@testing-library/react';

// override render method
export { customRender as render };
