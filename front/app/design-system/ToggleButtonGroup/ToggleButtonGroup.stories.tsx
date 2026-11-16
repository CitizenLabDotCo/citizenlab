import React from 'react';

import ToggleButton from '../ToggleButton';

import ToggleButtonGroup from '.';

import type { Meta, StoryObj } from '@storybook/react';

const meta = {
  title: 'Design system/Actions/ToggleButtonGroup',
  component: ToggleButtonGroup,
  args: {
    'aria-label': 'Layout',
    defaultSelectedKeys: ['nested'],
    children: [
      <ToggleButton key="nested" id="nested">
        Nested
      </ToggleButton>,
      <ToggleButton key="flat" id="flat">
        Flat
      </ToggleButton>,
    ],
  },
} satisfies Meta<typeof ToggleButtonGroup>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const AllVariants: Story = {
  render: () => (
    <div style={{ display: 'grid', gap: 16, justifyItems: 'start' }}>
      <ToggleButtonGroup aria-label="Layout" defaultSelectedKeys={['nested']}>
        <ToggleButton id="nested">Nested</ToggleButton>
        <ToggleButton id="flat">Flat</ToggleButton>
      </ToggleButtonGroup>
      <ToggleButtonGroup aria-label="Option" defaultSelectedKeys={['one']}>
        <ToggleButton id="one">Option</ToggleButton>
        <ToggleButton id="two">Option</ToggleButton>
        <ToggleButton id="three">Option</ToggleButton>
      </ToggleButtonGroup>
    </div>
  ),
};
