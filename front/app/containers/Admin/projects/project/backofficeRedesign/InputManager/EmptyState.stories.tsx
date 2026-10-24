import { Meta, StoryObj } from '@storybook/react';

import EmptyState from './EmptyState';

// What the input manager shows when a phase has no inputs yet.

const meta = {
  title: 'Components/Redesigned/Input manager empty state',
  tags: ['bo'],
  component: EmptyState,
} satisfies Meta<typeof EmptyState>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const RTL: Story = {
  globals: { lang: 'ar' },
};
