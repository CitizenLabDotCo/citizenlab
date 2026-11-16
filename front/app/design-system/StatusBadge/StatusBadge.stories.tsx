import React from 'react';

import StatusBadge, { StatusBadgeStatus } from '.';

import type { Meta, StoryObj } from '@storybook/react';

const meta = {
  title: 'Design system/Status & feedback/Status badge',
  component: StatusBadge,
  args: { children: 'Draft' },
} satisfies Meta<typeof StatusBadge>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};

const statuses: { status: StatusBadgeStatus; label: string }[] = [
  { status: 'draft', label: 'Draft' },
  { status: 'live', label: 'Live' },
  { status: 'published', label: 'Published' },
  { status: 'pendingApproval', label: 'Pending approval' },
  { status: 'archived', label: 'Archived' },
];

export const AllVariants: Story = {
  render: () => (
    <div style={{ display: 'grid', gap: 16 }}>
      {([18, 20] as const).map((size) => (
        <div
          key={size}
          style={{ display: 'flex', gap: 16, alignItems: 'center' }}
        >
          {statuses.map(({ status, label }) => (
            <StatusBadge key={status} status={status} size={size}>
              {label}
            </StatusBadge>
          ))}
        </div>
      ))}
    </div>
  ),
};
