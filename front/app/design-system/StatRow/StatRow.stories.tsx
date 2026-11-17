import React, { useState } from 'react';

import StatRow from '.';

import type { Meta, StoryObj } from '@storybook/react';

const meta = {
  title: 'Design system/Data display/Stat row',
  component: StatRow,
  args: { label: 'Waiting for a reply', value: '40', onPress: () => {} },
} satisfies Meta<typeof StatRow>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  render: (args) => (
    <div style={{ width: 292 }}>
      <StatRow label={args.label} value={args.value} onPress={() => {}} />
    </div>
  ),
};

// The Stats frame of the Manage side panel: padding 8, gap 0.
export const AllVariants: Story = {
  render: () => (
    <div style={{ width: 292, display: 'grid', gap: 24 }}>
      <StatRow label="Waiting for a reply" value="40" onPress={() => {}} />
      <StatRow label="New ideas" value="18" isNew onPress={() => {}} />
      <StatRow label="New comments" value="33" href="#comments" />
      <StatRow label="New statements" value="4" />
    </div>
  ),
};

const PressedRows = () => {
  const [isPressed, setIsPressed] = useState(true);

  return (
    <div style={{ width: 292 }}>
      <StatRow
        label="Waiting for a reply"
        value="40"
        isPressed={isPressed}
        onPress={() => setIsPressed((pressed) => !pressed)}
      />
      <StatRow
        label="Unassigned"
        value="12"
        isPressed={false}
        onPress={() => {}}
      />
    </div>
  );
};

// isPressed: a toggle row whose filter is on (aria-pressed, surface/row-selected).
export const Pressed: Story = {
  render: () => <PressedRows />,
};
