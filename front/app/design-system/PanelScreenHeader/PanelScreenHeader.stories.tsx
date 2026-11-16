import React from 'react';

import PanelScreenHeader from '.';

import type { Meta, StoryObj } from '@storybook/react';

const meta = {
  title: 'Design system/Layout & containers/PanelScreenHeader',
  component: PanelScreenHeader,
  args: {
    title: 'Idea tags',
    backLabel: 'Back to Ideation setup',
    onBack: () => {},
  },
  decorators: [
    (Story) => (
      <div style={{ width: 444 }}>
        <Story />
      </div>
    ),
  ],
} satisfies Meta<typeof PanelScreenHeader>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};
