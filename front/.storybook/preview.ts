import contexts from './contexts';
import { reactIntl } from './reactIntl';
import { withRouter } from 'storybook-addon-react-router-v6';
import { initialize, mswDecorator } from 'msw-storybook-addon';
import mockServer from './mockServer'

initialize();

export const decorators = [
  mswDecorator,
  withRouter,
  contexts
];

export const globals = {
  locale: reactIntl.defaultLocale
}

export const parameters = {
  options: {
    storySort: {
      method: 'alphabetical',
      // order: ['Design', 'Components'],
      locales: '',
    },
  },
  msw: Object.values(mockServer),
  reactIntl
};