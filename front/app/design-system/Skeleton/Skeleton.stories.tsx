import React from 'react';

import Skeleton from '.';

import type { Meta, StoryObj } from '@storybook/react';

const meta = {
  title: 'Design system/Status & feedback/Skeleton',
  component: Skeleton,
} satisfies Meta<typeof Skeleton>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  render: () => (
    <div style={{ display: 'grid', gap: 12, width: 320 }} aria-busy>
      <Skeleton width={202} height={24} />
      <Skeleton width={140} />
      <Skeleton height={12} />
      <Skeleton shape='block' height={168} />
    </div>
  ),
};
