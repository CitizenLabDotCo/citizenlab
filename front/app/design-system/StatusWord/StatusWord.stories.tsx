import React from 'react';

import StatusWord, { StatusWordStatus } from '.';

import type { Meta, StoryObj } from '@storybook/react';

const meta = {
  title: 'Design system/Status & feedback/Status word',
  component: StatusWord,
  args: { children: 'Published' },
} satisfies Meta<typeof StatusWord>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};

const statuses: { status: StatusWordStatus; label: string }[] = [
  { status: 'published', label: 'Published' },
  { status: 'draft', label: 'Draft' },
  { status: 'pendingApproval', label: 'Pending approval' },
  { status: 'archived', label: 'Archived' },
];

export const AllVariants: Story = {
  render: () => (
    <div style={{ display: 'grid', gap: 16 }}>
      {[false, true].map((showSub) => (
        <div
          key={String(showSub)}
          style={{ display: 'flex', gap: 32, alignItems: 'flex-start' }}
        >
          {statuses.map(({ status, label }) => (
            <StatusWord
              key={status}
              status={status}
              sub={showSub ? 'Hidden' : undefined}
            >
              {label}
            </StatusWord>
          ))}
        </div>
      ))}
    </div>
  ),
};
