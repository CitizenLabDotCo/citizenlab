import React from 'react';
import { Preview } from '@storybook/react';
import contexts from './contexts';
import { setupWorker } from 'msw/browser';
import type { RequestHandler } from 'msw';
import mockServer from './mockServer';
import { reactIntl } from './reactIntl';
import { MemoryRouter } from 'utils/router';
import { allModes } from './modes';
import { MINIMAL_VIEWPORTS } from 'storybook/viewport';
import { IntlProvider } from 'react-intl';
import { JSX } from 'react/jsx-runtime';

// Some app modules (e.g. appConfigurationStream) fetch as soon as they are
// imported, before any loader runs. Starting the worker here, with the default
// handlers, makes Storybook wait for it before it imports any stories file.
const worker = setupWorker(...Object.values(mockServer));
await worker.start({ quiet: true, onUnhandledRequest: 'bypass' });

// Stories override the default handlers with `parameters.msw`
// (see utils/storybook/mockEndpoints).
const mswLoader = async ({
  parameters,
}: {
  parameters: { msw?: RequestHandler[] };
}) => {
  worker.resetHandlers();
  if (parameters.msw) worker.use(...parameters.msw);
  return {};
};

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
  loaders: [mswLoader],
  decorators: [routerDecorator, contexts],
};

export default preview;
