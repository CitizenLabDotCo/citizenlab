import React from 'react';

import StatusBadge from '.';

import type { Meta, StoryObj } from '@storybook/react';

const meta = {
  title: 'Design system/Status & feedback/Status badge',
  component: StatusBadge,
  args: { children: 'Draft', status: 'draft' },
} satisfies Meta<typeof StatusBadge>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const AllVariants: Story = {
  render: () => (
    <div style={{ display: 'flex', gap: 16, alignItems: 'center' }}>
      <StatusBadge status="draft">Draft</StatusBadge>
      <StatusBadge status="published">Published</StatusBadge>
    </div>
  ),
};
