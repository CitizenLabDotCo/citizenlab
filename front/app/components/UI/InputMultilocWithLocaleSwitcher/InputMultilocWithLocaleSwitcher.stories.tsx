import { Meta, StoryObj } from '@storybook/react';
import { http, HttpResponse } from 'msw';
import { fn, waitFor } from 'storybook/test';

import { getAppConfigurationData } from 'api/app_configuration/__mocks__/_mockServer';

import mockEndpoints from 'utils/storybook/mockEndpoints';

import InputMultilocWithLocaleSwitcher from '.';

// The locales come from the app configuration. The default mock has only
// `en`, so most stories serve three locales to show the locale switcher.
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
// The play step waits for the refetched configuration, because the query
// cache can still hold the three locales of the story before.
export const SingleLocale: Story = {
  args: Default.args,
  parameters: { msw: mockEndpoints({}) },
  play: async ({ canvasElement }) => {
    await waitFor(() => {
      if (canvasElement.textContent.toLowerCase().includes('nl-be')) {
        throw new globalThis.Error('still showing three locales');
      }
    });
  },
};

export const RTL: Story = {
  globals: { lang: 'ar' },
  args: {
    label: 'عنوان المشروع',
    valueMultiloc: { en: 'شوارع خضراء' },
  },
};
