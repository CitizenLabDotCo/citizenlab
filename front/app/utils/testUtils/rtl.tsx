import { render, RenderOptions } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import GlobalStyle from 'global-styles';
import messages from 'i18n/en';
import React from 'react';
import { IntlProvider } from 'react-intl';
import { unstable_HistoryRouter as HistoryRouter } from 'react-router-dom';
import { ThemeProvider } from 'styled-components';
import history from 'utils/browserHistory';
import { getTheme } from 'utils/styleUtils';

window.confirm = jest.fn(() => true);
window.scrollTo = jest.fn();
global.URL.createObjectURL = jest.fn();
Element.prototype.scrollTo = jest.fn();
Element.prototype.scrollIntoView = jest.fn();

const AllTheProviders = ({ children }) => {
  return (
    <HistoryRouter history={history}>
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
    </HistoryRouter>
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
export * from '@testing-library/react';
// override render method
export { customRender as render };
export { userEvent };
