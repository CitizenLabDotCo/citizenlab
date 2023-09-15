import contexts from './contexts';
import { withRouter } from 'storybook-addon-react-router-v6';
import { initialize, mswDecorator } from 'msw-storybook-addon';
import mockServer from './mockServer'

initialize();

export const decorators = [
  mswDecorator,
  withRouter,
  contexts
];

export const parameters = {
  options: {
    storySort: {
      method: 'alphabetical',
      order: ['Design', 'Components'],
      locales: '',
    },
  },
  msw: Object.values(mockServer)
};