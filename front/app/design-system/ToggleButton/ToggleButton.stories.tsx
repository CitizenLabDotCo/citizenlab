import React from 'react';

import ToggleButtonGroup from '../ToggleButtonGroup';

import ToggleButton from '.';

import type { Meta, StoryObj } from '@storybook/react';

const meta = {
  title: 'Design system/Actions/ToggleButton',
  component: ToggleButton,
  args: { children: 'Option', id: 'option' },
} satisfies Meta<typeof ToggleButton>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};

// A ToggleButton only draws Selected inside a ToggleButtonGroup.
export const AllVariants: Story = {
  render: () => (
    <ToggleButtonGroup
      aria-label="Option"
      selectedKeys={['selected']}
      onSelectionChange={() => {}}
    >
      <ToggleButton id="selected">Selected</ToggleButton>
      <ToggleButton id="unselected">Unselected</ToggleButton>
    </ToggleButtonGroup>
  ),
};
