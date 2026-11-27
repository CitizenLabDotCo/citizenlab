import React from 'react';

import EmptyState from '.';

import type { Meta, StoryObj } from '@storybook/react';

const meta = {
  title: 'Design system/Status & feedback/Empty state',
  component: EmptyState,
  args: { children: 'There are no projects available.' },
} satisfies Meta<typeof EmptyState>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const AllVariants: Story = {
  render: () => (
    <div style={{ display: 'grid', gap: 16 }}>
      <div style={{ width: 760 }}>
        <EmptyState context="list">There are no projects available.</EmptyState>
      </div>
      <div style={{ width: 360 }}>
        <EmptyState context="card">There are no projects available.</EmptyState>
      </div>
    </div>
  ),
};
