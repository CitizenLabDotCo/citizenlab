import React from 'react';

import LocaleSwitcher from '.';

import type { Meta, StoryObj } from '@storybook/react';

const meta = {
  title: 'Components/Forms/LocaleSwitcher',
  tags: ['shared'],
  parameters: { gv: {} },
  render: (props) => {
    return (
      <div style={{ width: '250px' }}>
        <LocaleSwitcher {...props} />
      </div>
    );
  },
} satisfies Meta<typeof LocaleSwitcher>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    onSelectedLocaleChange: () => {},
    locales: ['en-GB', 'nl-BE'],
    selectedLocale: 'en-GB',
    values: {
      bleh: {
        'en-GB': '',
        'nl-BE': '',
      },
    },
  },
};

export const WithANoneEmptyValue: Story = {
  args: {
    onSelectedLocaleChange: () => {},
    locales: ['en-GB', 'nl-BE'],
    selectedLocale: 'en-GB',
    values: {
      bleh: {
        'en-GB': '',
        'nl-BE': 'Een willekeurige waarde',
      },
    },
  },
};

// Hover and focus on the locale that is not selected (the selected one has
// no hover style).
export const Hover: Story = {
  args: Default.args,
  parameters: { pseudo: { hover: ['.nl-BE'] } },
};

export const Focus: Story = {
  args: Default.args,
  parameters: { pseudo: { focusVisible: ['.nl-BE'] } },
};

export const LongContent: Story = {
  args: {
    ...Default.args,
    locales: ['en-GB', 'nl-BE', 'fr-BE', 'de-DE', 'es-ES', 'da-DK', 'ar-MA'],
    values: {
      title: {
        'en-GB': 'Title',
        'nl-BE': 'Titel',
        'fr-BE': 'Titre',
        'de-DE': '',
        'es-ES': '',
        'da-DK': '',
        'ar-MA': '',
      },
    },
  },
};

export const RTL: Story = {
  globals: { lang: 'ar' },
  args: {
    ...Default.args,
    locales: ['ar-MA', 'en-GB'],
    selectedLocale: 'ar-MA',
    values: { title: { 'ar-MA': 'عنوان', 'en-GB': '' } },
  },
};
