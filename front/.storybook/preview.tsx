import React from 'react';
import { Preview, StoryContext } from '@storybook/react';
import contexts from './contexts';
import { initialize, mswDecorator } from 'msw-storybook-addon';
import mockServer from './mockServer';
import { reactIntl, locales, StorybookLocale } from './reactIntl';
import { cities } from './cities';
import { GV_VIEWPORTS } from './viewports';
import { MemoryRouter } from 'utils/router';
import { allModes } from './modes';
import { MINIMAL_VIEWPORTS } from 'storybook/viewport';
import { IntlProvider } from 'react-intl';
import { JSX } from 'react/jsx-runtime';
import '../app/design-system/tokens/tokens.css';

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

// Mode of the design tokens: `today` is :root (no attribute), `redesign`
// sets data-gv-mode on the preview's root element, like ModeScope does on
// the redesigned pages. The workbench shell sets the same global in the
// frame URL.
const modeDecorator = (Story: () => JSX.Element, context: StoryContext) => {
  const root = document.documentElement;
  if (context.globals.mode === 'redesign') {
    root.setAttribute('data-gv-mode', 'redesign');
  } else {
    root.removeAttribute('data-gv-mode');
  }
  return <Story />;
};

const preview: Preview = {
  globalTypes: {
    mode: {
      description: 'Design token mode',
      toolbar: {
        title: 'Mode',
        icon: 'mirror',
        items: [
          { value: 'today', title: 'Today' },
          { value: 'redesign', title: 'Redesign' },
        ],
        dynamicTitle: true,
      },
    },
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
    mode: 'today',
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
      options: {
        ...GV_VIEWPORTS,
        ...MINIMAL_VIEWPORTS,
      },
    },
  },
  decorators: [mswDecorator, routerDecorator, contexts, modeDecorator],
};

export default preview;
