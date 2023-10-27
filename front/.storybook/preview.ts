import type { Preview } from '@storybook/react';
import { initialize, mswDecorator } from 'msw-storybook-addon';
import mockServer from './mockServer'
import { reactIntl } from './reactIntl';
import { withRouter } from 'storybook-addon-react-router-v6';

initialize();

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
    withRouter
  ],

  globals: {
    locale: reactIntl.defaultLocale
  }
};

export default preview;
