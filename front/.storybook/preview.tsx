import React from 'react';
import type { Preview } from '@storybook/react';
import contexts from './contexts';
import { initialize, mswDecorator } from 'msw-storybook-addon';
import mockServer from './mockServer'
import { reactIntl } from './reactIntl';
// import { withRouter } from 'storybook-addon-react-router-v6';
import { MemoryRouter } from 'react-router-dom';

initialize();

const routerDecorator = (Story) => <MemoryRouter><Story /></MemoryRouter>;

const preview: Preview = {
  parameters: {
    actions: { argTypesRegex: '^on[A-Z].*' },
    controls: {
      matchers: {
        color: /(background|color)$/i,
        date: /Date$/i,
      },
    },

    msw: Object.values(mockServer),
    reactIntl
  },

  decorators: [
    mswDecorator,
    routerDecorator,
    contexts
  ],

  globals: {
    locale: reactIntl.defaultLocale
  }
};

export default preview;
