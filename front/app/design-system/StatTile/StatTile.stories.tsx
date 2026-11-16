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

export const AllVariants: Story = {
  render: () => (
    <div style={{ display: 'flex', gap: 24, alignItems: 'flex-start' }}>
      <div style={{ width: 183.5 }}>
        <StatTile label="Visitors" value="312" />
      </div>
      <div style={{ width: 144.8 }}>
        <StatTile type="tall" label="Visitors" value="23" />
      </div>
      <div style={{ width: 180.5 }}>
        <StatTile
          type="withNote"
          label="Voters"
          value="1"
          note="updating live"
        />
      </div>
    </div>
  ),
};
