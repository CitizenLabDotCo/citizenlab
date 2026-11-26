import React from 'react';

import BarRow from '../BarRow';
import EmptyState from '../EmptyState';
import IconButton from '../IconButton';
import Skeleton from '../Skeleton';

import DashboardCard from '.';

import type { Meta, StoryObj } from '@storybook/react';

const meta = {
  title: 'Design system/Charts/Dashboard card',
  component: DashboardCard,
  args: { title: 'Status breakdown', children: null },
  decorators: [
    (Story) => (
      <div style={{ width: 764 }}>
        <Story />
      </div>
    ),
  ],
} satisfies Meta<typeof DashboardCard>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  render: (args) => (
    <DashboardCard title={args.title}>
      <div>
        <BarRow label="Proposed" value="18% · 6" share={0.18} />
        <BarRow label="Viewed" value="30% · 10" share={0.3} />
        <BarRow label="Accepted" value="18% · 6" share={0.18} />
      </div>
    </DashboardCard>
  ),
};

export const WithIconAndActions: Story = {
  render: () => (
    <DashboardCard
      title="What are people saying?"
      icon="sparkles-16"
      actions={
        <IconButton
          icon="download-16"
          variant="ghost"
          size={28}
          aria-label="Download"
        />
      }
    >
      <Skeleton />
    </DashboardCard>
  ),
};

export const WithDescription: Story = {
  render: () => (
    <DashboardCard
      title="Most liked"
      description="These conversation threads got the most traction"
    >
      <EmptyState context="card">Nothing to show yet.</EmptyState>
    </DashboardCard>
  ),
};

export const Loading: Story = {
  render: (args) => (
    <DashboardCard title={args.title}>
      <div style={{ display: 'grid', gap: 12 }} aria-busy>
        <Skeleton />
        <Skeleton width="72%" />
        <Skeleton width="48%" />
      </div>
    </DashboardCard>
  ),
};
