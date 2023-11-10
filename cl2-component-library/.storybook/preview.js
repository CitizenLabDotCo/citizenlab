import ThemeDecorator from './themedecorator';

export const decorators = [ThemeDecorator];

export const parameters = {
  options: {
    storySort: {
      method: 'alphabetical',
      order: ['Design', 'Components'],
      locales: '',
    },
  },
};
