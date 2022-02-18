import React from 'react';
import { render, RenderOptions } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { ThemeProvider } from 'styled-components';
import { getTheme } from 'utils/styleUtils';
import GlobalStyle from 'global-styles';
import { IntlProvider } from 'react-intl';
import messages from 'i18n/en';
import { LiveAnnouncer } from 'react-aria-live';

window.confirm = jest.fn(() => true);
global.URL.createObjectURL = jest.fn();
Element.prototype.scrollTo = jest.fn();
Element.prototype.scrollIntoView = jest.fn();

const AllTheProviders = ({ children }) => {
  return (
    <LiveAnnouncer>
      <ThemeProvider theme={getTheme(null)}>
        <GlobalStyle />
        <IntlProvider locale="en" messages={messages}>
          <div id="modal-portal">{children}</div>
        </IntlProvider>
      </ThemeProvider>
    </LiveAnnouncer>
  );
};

const customRender: any = (ui: React.ReactElement, options?: RenderOptions) =>
  render(ui, { wrapper: AllTheProviders, ...options });

// re-export everything
export * from '@testing-library/react';

// override render method
export { customRender as render };
export { userEvent };
