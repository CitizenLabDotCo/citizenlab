import React from 'react';

import Divider from '.';

import type { Meta, StoryObj } from '@storybook/react';

const meta = {
  title: 'Design system/Layout & containers/Divider',
  component: Divider,
  decorators: [
    (Story) => (
      <div style={{ width: 264 }}>
        <Story />
      </div>
    ),
  ],
} satisfies Meta<typeof Divider>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};
