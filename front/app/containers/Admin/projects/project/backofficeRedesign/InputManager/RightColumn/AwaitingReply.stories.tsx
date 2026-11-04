import React from 'react';

import { Meta, StoryObj } from '@storybook/react';
import { fn } from 'storybook/test';

import AwaitingReply from './AwaitingReply';

// The orange notice in the input manager's right column: how many inputs
// still wait for an official reply, with a link that filters the list to
// them. It shows nothing when none wait.

const meta = {
  title: 'Components/Redesigned/Input manager/Awaiting reply',
  tags: ['bo', 'redesigned'],
  component: AwaitingReply,
  args: { count: 5, onShow: fn() },
  decorators: [
    (Story) => (
      <div style={{ width: 340 }}>
        <Story />
      </div>
    ),
  ],
} satisfies Meta<typeof AwaitingReply>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const OneInput: Story = {
  args: { count: 1 },
};

export const RTL: Story = {
  globals: { lang: 'ar' },
};
