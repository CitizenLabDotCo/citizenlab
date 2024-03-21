import LocaleSwitcher from '.';

import type { Meta, StoryObj } from '@storybook/react';

const meta = {
  title: 'Components/LocaleSwitcher',
  component: LocaleSwitcher,
  parameters: {
    layout: 'centered',
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
