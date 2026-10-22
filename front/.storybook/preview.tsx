import React from 'react';
import { Preview } from '@storybook/react';
import contexts from './contexts';
import { initialize, mswDecorator } from 'msw-storybook-addon';
import mockServer from './mockServer';
import { reactIntl } from './reactIntl';
import { MemoryRouter } from 'utils/router';
import { allModes } from './modes';
import { MINIMAL_VIEWPORTS } from 'storybook/viewport';
import { IntlProvider } from 'react-intl';
import { JSX } from 'react/jsx-runtime';

// Relative URL so the worker also loads when Storybook is served from a
// sub-path (e.g. /storybook/ in epic previews).
initialize({ serviceWorker: { url: './mockServiceWorker.js' } });

const routerDecorator = (Story: () => JSX.Element) => (
  <MemoryRouter>
    <IntlProvider
      locale={reactIntl.defaultLocale}
      messages={
        reactIntl.messages[
          reactIntl.defaultLocale as keyof typeof reactIntl.messages
        ]
      }
    >
      <Story />
    </IntlProvider>
  </MemoryRouter>
);

const preview: Preview = {
  parameters: {
    controls: {
      matchers: {
        color: /(background|color)$/i,
        date: /Date$/i,
      },
    },
    msw: Object.values(mockServer),
    reactIntl,
    chromatic: {
      modes: {
        ...allModes,
      },
      disableSnapshot: true,
    },
    viewport: {
      viewports: {
        ...MINIMAL_VIEWPORTS,
      },
    },
  },
  decorators: [mswDecorator, routerDecorator, contexts],
};

export default preview;
