import React, { useState } from 'react';

import { fn } from 'storybook/test';

import Box from '../Box';
import Text from '../Text';

import Radio from '.';

import type { Meta, StoryObj } from '@storybook/react';

// The back-office radio: a 16px grey ring with an 8px dot and a tighter
// label, as in the choices of the New project form.

const Choice = ({ title, description }: { title: string; description: string }) => (
  <Box display="flex" flexDirection="column" gap="2px">
    <Text variant="boControl" m="0px">
      {title}
    </Text>
    <Text variant="boMicro" color="coolGrey500" lineHeight="16px" m="0px">
      {description}
    </Text>
  </Box>
);

const OPTIONS = [
  {
    value: 'public',
    title: 'Everyone',
    description: 'Anyone with the link can open the project',
  },
  {
    value: 'admins',
    title: 'Admins and managers only',
    description: 'Only the people who manage it can open it',
  },
  {
    value: 'groups',
    title: 'Selected groups',
    description: 'Only members of the groups you choose',
  },
];

const Group = ({ disabled = false }: { disabled?: boolean }) => {
  const [value, setValue] = useState('admins');
  return (
    <Box display="flex" flexDirection="column" gap="12px">
      {OPTIONS.map((option) => (
        <Radio
          key={option.value}
          variant="bo"
          name="bo-radio-story"
          value={option.value}
          currentValue={value}
          onChange={setValue}
          disabled={disabled}
          label={<Choice {...option} />}
        />
      ))}
    </Box>
  );
};

const meta = {
  title: 'Components/Redesigned/Library variants/Back-office radio',
  tags: ['bo', 'redesigned'],
  component: Radio,
  args: {
    variant: 'bo',
    name: 'bo-radio-single',
    value: 'on',
    currentValue: 'on',
    label: 'Admins and managers only',
    onChange: fn(),
  },
  decorators: [
    (Story) => (
      <Box w="360px" p="24px" background="white">
        <Story />
      </Box>
    ),
  ],
} satisfies Meta<typeof Radio>;

export default meta;
type Story = StoryObj<typeof meta>;

/** A group of three choices, the middle one selected. */
export const Default: Story = {
  render: () => <Group />,
};

/** One radio, selected. */
export const Checked: Story = {};

/** One radio, not selected. */
export const Unchecked: Story = {
  args: { currentValue: 'off' },
};

export const Disabled: Story = {
  render: () => <Group disabled />,
};

export const RTL: Story = {
  globals: { lang: 'ar' },
  render: () => <Group />,
};
