import React from 'react';

import ReviewStatus from '.';

import type { Meta, StoryObj } from '@storybook/react';

const meta = {
  title: 'Design system/Status & feedback/Review status',
  component: ReviewStatus,
  args: { status: 'toReview' },
} satisfies Meta<typeof ReviewStatus>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const AllVariants: Story = {
  render: () => (
    <div style={{ display: 'flex', gap: 32, alignItems: 'center' }}>
      <ReviewStatus status="toReview" />
      <ReviewStatus status="toSet" />
      <ReviewStatus status="reviewed" />
    </div>
  ),
};
