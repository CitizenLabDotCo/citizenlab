import React from 'react';

import { fn } from 'storybook/test';

import Box from '../Box';
import Text from '../Text';

import SearchInput from '.';

import type { Meta, StoryObj } from '@storybook/react';

// The back-office search field: the bo text input with the magnifier inset
// on the left and no floating label, as in the input manager toolbar and
// the option picker.

const meta = {
  title: 'Components/Redesigned/Library variants/Back-office search input',
  tags: ['bo', 'redesigned'],
  component: SearchInput,
  args: {
    variant: 'bo',
    placeholder: 'Search inputs',
    ariaLabel: 'Search inputs',
    onChange: fn(),
  },
  decorators: [
    (Story, { name }) => (
      <Box w="320px" p="24px" background="white">
        <Text variant="boMicro" m="0px" mb="8px">
          {name}
        </Text>
        <Story />
      </Box>
    ),
  ],
} satisfies Meta<typeof SearchInput>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};

/** With a search typed in: the clear button shows. */
export const WithValue: Story = {
  args: { defaultValue: 'bike lanes' },
};

/** Focused: tenant-primary border and ring. */
export const Focus: Story = {
  parameters: { pseudo: { focus: ['input'], focusVisible: ['input'] } },
};

/** The small size the option picker uses. */
export const Small: Story = {
  args: { size: 'small', placeholder: 'Search folders' },
};

export const RTL: Story = {
  globals: { lang: 'ar' },
  args: { defaultValue: 'bike lanes' },
};
