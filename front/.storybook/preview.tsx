import React from 'react';
import { Preview, StoryContext } from '@storybook/react';
import contexts from './contexts';
import { initialize, mswDecorator } from 'msw-storybook-addon';
import mockServer from './mockServer';
import { loadMessages, reactIntl } from './reactIntl';
import { LANGUAGES } from './languages';
import { cities, DEFAULT_CITY } from './cities';
import { GV_VIEWPORTS } from './viewports';
import { MemoryRouter } from 'utils/router';
import { queryClient } from 'utils/cl-react-query/queryClient';
import { allModes } from './modes';
import { MINIMAL_VIEWPORTS } from 'storybook/viewport';
import { IntlProvider } from 'react-intl';
import { JSX } from 'react/jsx-runtime';
import '../app/design-system/tokens/tokens.css';

// The mock worker posts MOCKING_ENABLED once it serves this page. Requests
// sent before that reach the static server instead (the app configuration
// stream fetches as soon as it is imported), fail, and are not retried.
const mocksReady = new Promise<void>((resolve) => {
  navigator.serviceWorker?.addEventListener('message', (event) => {
    if (event.data?.type === 'MOCKING_ENABLED') resolve();
  });
  setTimeout(resolve, 5000);
});

// Relative URL so the worker also loads when Storybook is served from a
// sub-path (e.g. /storybook/ in epic previews). The default handlers are
// registered from the start, not only once the first story renders.
initialize(
  { serviceWorker: { url: './mockServiceWorker.js' } },
  Object.values(mockServer)
);

// Waits until the mocks serve this page, then fetches every query that has
// no data again, so a request that went out too early does not stay failed.
const mocksReadyLoader = async () => {
  await mocksReady;
  await queryClient.refetchQueries({
    predicate: (query) => query.state.status !== 'success',
  });
  return {};
};

// The messages of the story's language, from its own chunk.
const intlLoader = async (context: StoryContext) => ({
  intlMessages: await loadMessages(context.globals.lang),
});

const routerDecorator = (Story: () => JSX.Element, context: StoryContext) => (
  <MemoryRouter>
    <IntlProvider
      locale={context.globals.lang}
      defaultLocale={reactIntl.defaultLocale}
      messages={context.loaded.intlMessages}
    >
      <Story />
    </IntlProvider>
  </MemoryRouter>
);

// The a11y addon runs axe (a 546 KB chunk and a few hundred ms of CPU)
// after every render. Only Storybook's own a11y panel shows that result,
// so a frame embedded elsewhere in story view (the workbench component
// page, Review and isolated gallery cards) skips it; the shared gallery
// frame renders in docs view, where the addon never runs axe. Standalone frames and the Storybook UI keep the
// automatic run; ds:a11y brings its own axe either way.
const embeddedOutsideStorybook = (() => {
  try {
    const id = window.frameElement?.id;
    return (
      id !== undefined &&
      id !== 'storybook-preview-iframe' &&
      !id.startsWith('storybook-ref-')
    );
  } catch {
    return false;
  }
})();

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
        items: LANGUAGES.map(({ value, label }) => ({ value, title: label })),
        dynamicTitle: true,
      },
    },
  },
  initialGlobals: {
    city: DEFAULT_CITY,
    lang: 'en',
    ...(embeddedOutsideStorybook && { a11y: { manual: true } }),
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
      options: {
        ...GV_VIEWPORTS,
        ...MINIMAL_VIEWPORTS,
      },
    },
  },
  loaders: [mocksReadyLoader, intlLoader],
  decorators: [mswDecorator, routerDecorator, contexts],
};

export default preview;
