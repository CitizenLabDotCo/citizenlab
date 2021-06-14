import React from 'react';
import { render, RenderOptions } from '@testing-library/react';
import { ThemeProvider } from 'styled-components';
import { getTheme } from 'utils/styleUtils';
import GlobalStyle from 'global-styles';
import { IntlProvider } from 'react-intl';
import messages from 'i18n/en';
import { LiveAnnouncer } from 'react-aria-live';

const AllTheProviders = ({ children }) => {
  return (
    <div id="modal-portal">
      <LiveAnnouncer>
        <ThemeProvider theme={getTheme(null)}>
          <GlobalStyle />
          <IntlProvider locale="en" messages={messages}>
            {children}
          </IntlProvider>
        </ThemeProvider>
      </LiveAnnouncer>
    </div>
  );
};

const customRender = (ui: React.ReactElement, options?: RenderOptions) =>
  render(ui, { wrapper: AllTheProviders, ...options });

// re-export everything
export * from '@testing-library/react';

// override render method
export { customRender as render };
