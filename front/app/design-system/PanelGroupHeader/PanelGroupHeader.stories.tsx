import React from 'react';

import IconButton from '../IconButton';

import PanelGroupHeader from '.';

import type { Meta, StoryObj } from '@storybook/react';

const meta = {
  title: 'Design system/Layout & containers/PanelGroupHeader',
  component: PanelGroupHeader,
  args: { label: 'Settings' },
  decorators: [
    (Story) => (
      <div style={{ width: 444 }}>
        <Story />
      </div>
    ),
  ],
} satisfies Meta<typeof PanelGroupHeader>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    action: <IconButton icon="rows-expand-16" aria-label="Expand all" />,
  },
};

export const AllVariants: Story = {
  render: () => (
    <div style={{ display: 'grid', gap: 24 }}>
      <PanelGroupHeader
        label="Settings"
        context="panel"
        action={<IconButton icon="rows-expand-16" aria-label="Expand all" />}
      />
      <PanelGroupHeader label="How ideas are shown" context="panel" />
      <PanelGroupHeader
        label="Events"
        context="rail"
        action={<IconButton icon="plus-16" aria-label="New event" />}
      />
      <PanelGroupHeader label="Timeline" context="rail" />
    </div>
  ),
};
