import React from 'react';

import StatTile from '.';

import type { Meta, StoryObj } from '@storybook/react';

const meta = {
  title: 'Design system/Data display/Stat tile',
  component: StatTile,
  args: { label: 'Visitors', value: '312' },
} satisfies Meta<typeof StatTile>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  render: (args) => (
    <div style={{ width: 183.5 }}>
      <StatTile label={args.label} value={args.value} />
    </div>
  ),
};
