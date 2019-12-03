import { configure, addParameters, addDecorator } from '@storybook/react';
import { DocsPage, DocsContainer } from '@storybook/addon-docs/blocks';
import { withKnobs } from '@storybook/addon-knobs';
import ThemeDecorator from './themedecorator';
import { INITIAL_VIEWPORTS } from '@storybook/addon-viewport';
import { themes } from '@storybook/theming';

addParameters({
  options: {
    theme: themes.light
  },
  docs: {
    container: DocsContainer,
    page: DocsPage
  },
  viewport: {
    viewports: INITIAL_VIEWPORTS,
  },
});

addDecorator(ThemeDecorator);

addDecorator(withKnobs);

configure(
  [
    require.context('../app', true, /\.stories\.(mdx|tsx?)$/)
  ],
  module
);
