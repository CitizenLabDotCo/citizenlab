import React from 'react';

import DropZone from '.';

import type { Meta, StoryObj } from '@storybook/react';

const meta = {
  title: 'Design system/Forms/Drop zone',
  component: DropZone,
  args: { onSelect: () => {} },
} satisfies Meta<typeof DropZone>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  render: (args) => (
    <div style={{ width: 370 }}>
      <DropZone {...args} />
    </div>
  ),
};

export const AllVariants: Story = {
  render: (args) => (
    <div style={{ width: 370, display: 'grid', gap: 16 }}>
      <DropZone {...args} />
      <DropZone {...args} isDisabled />
    </div>
  ),
};
