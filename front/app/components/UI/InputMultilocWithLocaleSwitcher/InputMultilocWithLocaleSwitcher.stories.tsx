import { Meta, StoryObj } from '@storybook/react';
import { http, HttpResponse } from 'msw';
import { fn, waitFor } from 'storybook/test';

import { getAppConfigurationData } from 'api/app_configuration/__mocks__/_mockServer';

import mockEndpoints from 'utils/storybook/mockEndpoints';

import InputMultilocWithLocaleSwitcher from '.';

// The locales come from the app configuration. The default mock has only
// `en`, so most stories serve three locales to show the locale switcher.
// The component renders nothing until the configuration (MSW) has loaded, so
// the play steps wait for the rendered input and switcher.
const waitForInput = (canvasElement: HTMLElement, switcher: boolean) =>
  waitFor(
    () => {
      const text = canvasElement.textContent.toLowerCase();
      if (
        !canvasElement.querySelector('input') ||
        text.includes('nl-be') !== switcher
      ) {
        throw new globalThis.Error('configuration not loaded yet');
      }
    },
    { timeout: 10000 }
  );
const threeLocales = mockEndpoints({
  'GET app_configuration': http.get('/web_api/v1/app_configuration', () =>
    HttpResponse.json({
      data: getAppConfigurationData({
        settings: {
          ...getAppConfigurationData().attributes.settings,
          core: {
            ...getAppConfigurationData().attributes.settings.core,
            locales: ['en', 'nl-BE', 'fr-BE'],
          },
        },
      }),
    })
  ),
});

const meta = {
  title: 'Components/Forms/InputMultilocWithLocaleSwitcher',
  tags: ['shared'],
  parameters: { gv: {}, msw: threeLocales },
  component: InputMultilocWithLocaleSwitcher,
  args: { onChange: fn(), type: 'text' },
  play: async ({ canvasElement }) => {
    await waitForInput(canvasElement, true);
  },
} satisfies Meta<typeof InputMultilocWithLocaleSwitcher>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    label: 'Project title',
    valueMultiloc: {
      en: 'Green streets',
      'nl-BE': 'Groene straten',
      'fr-BE': 'Rues vertes',
    },
  },
};

export const Focus: Story = {
  args: Default.args,
  parameters: { pseudo: { focus: ['input'], focusVisible: ['input'] } },
};

export const Error: Story = {
  args: {
    ...Default.args,
    errorMultiloc: { en: 'Please enter a title in English.' },
  },
};

export const Disabled: Story = {
  args: { ...Default.args, disabled: true },
};

// With one platform locale there is nothing to switch, so it is hidden.
export const SingleLocale: Story = {
  args: Default.args,
  parameters: { msw: mockEndpoints({}) },
  play: async ({ canvasElement }) => {
    await waitForInput(canvasElement, false);
  },
};

export const RTL: Story = {
  globals: { lang: 'ar' },
  args: {
    label: 'عنوان المشروع',
    valueMultiloc: {
      en: 'شوارع خضراء',
      'nl-BE': 'شوارع خضراء',
      'fr-BE': 'شوارع خضراء',
    },
  },
};
