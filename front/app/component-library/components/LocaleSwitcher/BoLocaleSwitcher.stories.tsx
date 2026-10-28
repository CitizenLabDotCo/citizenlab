import React from 'react';

import { fn } from 'storybook/test';

import Box from '../Box';

import LocaleSwitcher from '.';

import type { Meta, StoryObj } from '@storybook/react';

// The back-office locale tabs above a multilingual field: 26px grey chips
// with an 8px radius and a 6px dot that says whether that language is
// filled in.

const meta = {
  title: 'Components/Redesigned/Library variants/Back-office locale tabs',
  tags: ['bo', 'redesigned'],
  component: LocaleSwitcher,
  args: {
    variant: 'bo',
    onSelectedLocaleChange: fn(),
    locales: ['en', 'nl-BE', 'fr-BE'],
    selectedLocale: 'en',
    values: {
      title: { en: 'Tree planting', 'nl-BE': 'Bomen planten', 'fr-BE': '' },
    },
  },
  decorators: [
    (Story) => (
      <Box w="360px" p="24px" background="white">
        <Story />
      </Box>
    ),
  ],
} satisfies Meta<typeof LocaleSwitcher>;

export default meta;
type Story = StoryObj<typeof meta>;

/** Three languages, two filled in, English selected. */
export const Default: Story = {};

/** Nothing filled in yet. */
export const Empty: Story = {
  args: { values: { title: { en: '', 'nl-BE': '', 'fr-BE': '' } } },
};

/** Without values: no dots. */
export const NoDots: Story = {
  args: { values: undefined },
};

/** Another language selected. */
export const OtherSelected: Story = {
  args: { selectedLocale: 'nl-BE' },
};

/** Many languages: the tabs wrap. */
export const ManyLocales: Story = {
  args: {
    locales: ['en', 'nl-BE', 'fr-BE', 'de-DE', 'es-ES', 'it-IT', 'pt-BR', 'ar-SA'],
    values: { title: { en: 'Tree planting', 'nl-BE': 'Bomen planten' } },
  },
};

export const RTL: Story = {
  globals: { lang: 'ar' },
};
