import React, { useState } from 'react';

import { Box } from '@citizenlab/cl2-component-library';
import { Meta, StoryObj } from '@storybook/react';
import { fn } from 'storybook/test';

import { Visibility } from 'api/projects/types';

import { OPEN_OPTIONS } from '../../visibilityOptions';

import ChoiceRadio from './ChoiceRadio';

// One choice of the New project form: a bo radio with a 13px title (grey
// when not chosen) and a 12px grey description below.

const Group = () => {
  const [value, setValue] = useState<Visibility>('admins');
  return (
    <Box display="flex" flexDirection="column" gap="12px">
      {OPEN_OPTIONS.map((option) => (
        <ChoiceRadio<Visibility>
          key={option.value}
          name="choice-radio-story"
          option={option}
          currentValue={value}
          onChange={setValue}
        />
      ))}
    </Box>
  );
};

const meta = {
  title: 'Components/Redesigned/New project/Choice radio',
  tags: ['bo', 'redesigned'],
  component: ChoiceRadio<Visibility>,
  args: {
    name: 'choice-radio-single',
    option: OPEN_OPTIONS[1],
    currentValue: 'admins',
    onChange: fn(),
  },
  decorators: [
    (Story) => (
      <Box w="420px" p="24px" background="white">
        <Story />
      </Box>
    ),
  ],
} satisfies Meta<typeof ChoiceRadio<Visibility>>;

export default meta;
type Story = StoryObj<typeof meta>;

/** The three "who can open it" choices, the middle one chosen. */
export const Default: Story = {
  render: () => <Group />,
};

export const Checked: Story = {};

export const Unchecked: Story = {
  args: { currentValue: 'public' },
};

export const RTL: Story = {
  globals: { lang: 'ar' },
  render: () => <Group />,
};
