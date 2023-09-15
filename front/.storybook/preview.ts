import contexts from './contexts';
import { withRouter } from 'storybook-addon-react-router-v6';

export const decorators = [withRouter, contexts];

export const parameters = {
  options: {
    storySort: {
      method: 'alphabetical',
      order: ['Design', 'Components'],
      locales: '',
    },
  },
};