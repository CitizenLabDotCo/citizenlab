import React from 'react';

import Avatar from '.';

import type { Meta, StoryObj } from '@storybook/react';

const meta = {
  title: 'Design system/Data display/Avatar',
  component: Avatar,
  args: { initials: 'S' },
} satisfies Meta<typeof Avatar>;

export default meta;
type Story = StoryObj<typeof Avatar>;

export const Default: Story = {};

const sizes = [28, 24] as const;

export const AllVariants: Story = {
  render: () => (
    <div style={{ display: 'grid', gap: 16 }}>
      {sizes.map((size) => (
        <div
          key={size}
          style={{ display: 'flex', gap: 16, alignItems: 'center' }}
        >
          <Avatar size={size} initials="S" />
          <Avatar size={size} content="image" alt="Sam" />
          <Avatar size={size} content="empty" />
        </div>
      ))}
    </div>
  ),
};
