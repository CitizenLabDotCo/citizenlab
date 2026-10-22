import React from 'react';
import { Preview, StoryContext } from '@storybook/react';
import contexts from './contexts';
import { initialize, mswDecorator } from 'msw-storybook-addon';
import mockServer from './mockServer';
import { reactIntl, locales, StorybookLocale } from './reactIntl';
import { cities } from './cities';
import { MemoryRouter } from 'utils/router';
import { allModes } from './modes';
import { MINIMAL_VIEWPORTS } from 'storybook/viewport';
import { IntlProvider } from 'react-intl';
import { JSX } from 'react/jsx-runtime';

// Relative URL so the worker also loads when Storybook is served from a
// sub-path (e.g. /storybook/ in epic previews).
initialize({ serviceWorker: { url: './mockServiceWorker.js' } });

const routerDecorator = (
  Story: () => JSX.Element,
  context: StoryContext
) => (
  <MemoryRouter>
    <IntlProvider
      locale={context.globals.lang}
      defaultLocale={reactIntl.defaultLocale}
      messages={reactIntl.messages[context.globals.lang as StorybookLocale]}
    >
      <Story />
    </IntlProvider>
  </MemoryRouter>
);

const preview: Preview = {
  globalTypes: {
    city: {
      description: 'Preview components in a city brand',
      toolbar: {
        title: 'City',
        icon: 'paintbrush',
        items: Object.entries(cities).map(([value, city]) => ({
          value,
          title: city.title,
        })),
        dynamicTitle: true,
      },
    },
    lang: {
      description: 'Language',
      toolbar: {
        title: 'Language',
        icon: 'globe',
        items: locales,
        dynamicTitle: true,
      },
    },
  },
  initialGlobals: {
    city: 'default',
    lang: 'en',
  },
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
};

export default preview;
