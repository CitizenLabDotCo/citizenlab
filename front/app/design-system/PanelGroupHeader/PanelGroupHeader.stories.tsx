import React, { useState } from 'react';

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
    action: <IconButton icon="plus-16" aria-label="Add" />,
  },
};

export const AllVariants: Story = {
  render: () => (
    <div style={{ display: 'grid', gap: 24 }}>
      <PanelGroupHeader
        label="Settings"
        context="panel"
        action={<IconButton icon="plus-16" aria-label="Add" />}
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

export const Collapsible: Story = {
  render: function CollapsibleHeader() {
    const [expanded, setExpanded] = useState(false);

    return (
      <>
        <PanelGroupHeader
          label="Project details"
          toggle={{
            controls: 'details-content',
            expanded,
            onPress: () => setExpanded(!expanded),
          }}
        />
        <div id="details-content" hidden={!expanded}>
          Settings
        </div>
      </>
    );
  },
};
