import React from 'react';

import LocaleSwitcher from '.';

import type { Meta, StoryObj } from '@storybook/react';

const meta = {
  title: 'Components/LocaleSwitcher',
  render: (props) => {
    return (
      <div style={{ width: '250px' }}>
        <LocaleSwitcher {...props} />
      </div>
    );
  },
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
