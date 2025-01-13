import React, { ReactNode } from 'react';

import { getTheme } from '@citizenlab/cl2-component-library';
import { QueryClientProvider } from '@tanstack/react-query';
// eslint-disable-next-line no-restricted-imports
import { render, RenderOptions } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import GlobalStyle from 'global-styles';
import messages from 'i18n/en';
import { HelmetProvider } from 'react-helmet-async';
import { IntlProvider } from 'react-intl';
import { unstable_HistoryRouter as HistoryRouter } from 'react-router-dom';
import { ThemeProvider } from 'styled-components';

import history from 'utils/browserHistory';
import { queryClient } from 'utils/cl-react-query/queryClient';

window.confirm = jest.fn(() => true);
window.scrollTo = jest.fn();
global.URL.createObjectURL = jest.fn();
Element.prototype.scrollTo = jest.fn();
Element.prototype.scrollIntoView = jest.fn();
document.execCommand = jest.fn();

const AllTheProviders = ({ children }: { children: ReactNode }) => {
  return (
    <HelmetProvider>
      <HistoryRouter history={history as any}>
        <QueryClientProvider client={queryClient}>
          <ThemeProvider theme={getTheme(null)}>
            <GlobalStyle />
            <IntlProvider
              locale="en"
              messages={messages}
              onError={(err) => {
                if (err.code === 'MISSING_TRANSLATION') {
                  console.warn('Missing translation', err.message);
                  return;
                }
                throw err;
              }}
            >
              <div id="modal-portal">{children}</div>
            </IntlProvider>
          </ThemeProvider>
        </QueryClientProvider>
      </HistoryRouter>
    </HelmetProvider>
  );
};

Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: jest.fn().mockImplementation((query) => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: jest.fn(), // Deprecated
    removeListener: jest.fn(), // Deprecated
    addEventListener: jest.fn(),
    removeEventListener: jest.fn(),
    dispatchEvent: jest.fn(),
  })),
});

const customRender: any = (ui: React.ReactElement, options?: RenderOptions) =>
  render(ui, { wrapper: AllTheProviders, ...options });

// re-export everything
// eslint-disable-next-line no-restricted-imports
export * from '@testing-library/react';

// override render method
export { customRender as render };
export { userEvent };
