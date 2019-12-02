import { configure, addParameters, addDecorator } from '@storybook/react';
import { DocsPage, DocsContainer } from '@storybook/addon-docs/blocks';
import { getTheme } from '../app/utils/styleUtils';
import { withThemesProvider } from 'themeprovider-storybook';

addParameters({
  docs: {
    container: DocsContainer,
    page: DocsPage
  },
});

const theme = getTheme(null);

addDecorator(withThemesProvider(theme));

configure(
  [
    require.context('../app', true, /\.stories\.mdx$/),
    require.context('../app', true, /\.stories\.tsx?$/),
  ],
  module
);
