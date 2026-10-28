import React from 'react';

import { fn } from 'storybook/test';

import Box from '../Box';
import Text from '../Text';

import Input from '.';

import type { Meta, StoryObj } from '@storybook/react';

// The back-office text field of the redesigned project pages: 36px high,
// 8px radius, a thin grey border that turns tenant-primary with a soft ring
// on focus, red with a ring on error, and a small grey label above.

const meta = {
  title: 'Components/Redesigned/Library variants/Back-office text input',
  tags: ['bo', 'redesigned'],
  component: Input,
  args: {
    type: 'text',
    variant: 'bo',
    placeholder: 'Add event name',
    ariaLabel: 'Event name',
    value: '',
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
} satisfies Meta<typeof Input>;

export default meta;
type Story = StoryObj<typeof meta>;

/** Empty, with its placeholder. */
export const Default: Story = {};

/** Filled in. */
export const Filled: Story = {
  args: { value: 'Neighbourhood workshop on trees' },
};

/** Focused: tenant-primary border and a 3px ring. */
export const Focus: Story = {
  args: { value: 'Neighbourhood workshop' },
  parameters: { pseudo: { focus: ['input'], focusVisible: ['input'] } },
};

/** With an error: red border, red ring and the message below. */
export const Error: Story = {
  args: { value: '', error: 'Add a name for the event' },
};

/** With the small grey label above. */
export const WithLabel: Story = {
  args: { label: 'Address details', placeholder: 'Room, floor, entrance' },
};

export const Disabled: Story = {
  args: { value: 'Neighbourhood workshop', disabled: true },
};

/** All states side by side. */
export const AllStates: Story = {
  render: (args) => (
    <Box display="flex" flexDirection="column" gap="16px">
      {(
        [
          ['Default', {}],
          ['Filled', { value: 'Neighbourhood workshop' }],
          ['Error', { error: 'Add a name for the event' }],
          ['With label', { label: 'Address details' }],
          ['Disabled', { value: 'Neighbourhood workshop', disabled: true }],
        ] as const
      ).map(([name, extra]) => (
        <Box key={name}>
          <Text variant="boMicro" m="0px" mb="4px">
            {name}
          </Text>
          <Input {...args} {...extra} />
        </Box>
      ))}
    </Box>
  ),
};

export const RTL: Story = {
  globals: { lang: 'ar' },
  args: { label: 'Address details', value: 'Neighbourhood workshop' },
};
