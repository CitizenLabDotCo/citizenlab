import { configure, addParameters } from '@storybook/react';
import { DocsPage, DocsContainer } from '@storybook/addon-docs/blocks';

addParameters({
  docs: {
    container: DocsContainer,
    page: DocsPage
  },
});

configure(
  [
    require.context('../app', true, /\.stories\.mdx$/),
    require.context('../app', true, /\.stories\.tsx?$/),
  ],
  module
);
