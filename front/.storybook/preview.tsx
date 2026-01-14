import React from 'react';
import { Preview } from '@storybook/react';
import contexts from './contexts';
import { initialize, mswDecorator } from 'msw-storybook-addon';
import mockServer from './mockServer';
import { reactIntl } from './reactIntl';
import { MemoryRouter } from 'react-router-dom';
import { allModes } from './modes';
import { MINIMAL_VIEWPORTS } from '@storybook/addon-viewport';
import { IntlProvider } from 'react-intl';
import { JSX } from 'react/jsx-runtime';

initialize();

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
