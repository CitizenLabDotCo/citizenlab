import React from 'react';
import { Preview } from '@storybook/react';
import contexts from '../.storybook/contexts';
import { initialize, mswDecorator } from 'msw-storybook-addon';
import mockServer from '../.storybook/mockServer';
import { reactIntl } from '../.storybook/reactIntl';
import { MemoryRouter } from 'utils/router';
import { allModes } from '../.storybook/modes';
import { MINIMAL_VIEWPORTS } from '@storybook/addon-viewport';

initialize();

const routerDecorator = (Story) => (
  <MemoryRouter>
    <Story />
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
  globals: {
    locale: reactIntl.defaultLocale,
  },
};

export default preview;
