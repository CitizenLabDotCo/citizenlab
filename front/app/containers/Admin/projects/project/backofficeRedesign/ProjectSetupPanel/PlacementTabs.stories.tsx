import React from 'react';

import { Meta, StoryObj } from '@storybook/react';
import { fn } from 'storybook/test';

import PlacementTabs from './PlacementTabs';

// The two tabs on top of the "new participation method" modal: a phase on
// the timeline, or a standalone survey.

const meta = {
  title: 'Components/Redesigned/Setup panel/Placement tabs',
  tags: ['bo', 'redesigned'],
  component: PlacementTabs,
  args: { selected: 'on_timeline', onSelect: fn() },
  decorators: [
    (Story) => (
      <div style={{ width: 840, maxWidth: '100%', background: 'white' }}>
        <Story />
      </div>
    ),
  ],
} satisfies Meta<typeof PlacementTabs>;

export default meta;
type Story = StoryObj<typeof meta>;

/** On the timeline selected. */
export const Default: Story = {};

/** Standalone selected. */
export const Standalone: Story = {
  args: { selected: 'standalone' },
};

export const RTL: Story = {
  globals: { lang: 'ar' },
};
