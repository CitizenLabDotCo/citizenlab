import VoteProgress from '.';

import type { Meta, StoryObj } from '@storybook/react';

const meta = {
  title: 'Design system/Data display/Vote progress',
  component: VoteProgress,
  args: { count: 16, maximum: 30 },
} satisfies Meta<typeof VoteProgress>;

export default meta;
type Story = StoryObj<typeof VoteProgress>;

export const Default: Story = {};
export const NoVotes: Story = { args: { count: 0, maximum: 0 } };
