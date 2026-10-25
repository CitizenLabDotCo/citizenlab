import { Meta, StoryObj } from '@storybook/react';

import TagChips from './TagChips';

// The tags cell of the input list: the first two tags as chips, and a
// "+N" chip with the rest in a tooltip.

const meta = {
  title: 'Components/Redesigned/Input manager/Tag chips',
  tags: ['bo', 'redesigned'],
  component: TagChips,
  args: { labels: ['Trees', 'Shade'] },
} satisfies Meta<typeof TagChips>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const OneTag: Story = {
  args: { labels: ['Trees'] },
};

/** More than two tags: the rest fold into "+3". */
export const Overflow: Story = {
  args: { labels: ['Trees', 'Shade', 'Schools', 'Mobility', 'Water'] },
};


export const RTL: Story = {
  args: { labels: ['أشجار', 'ظل', 'مدارس'] },
  globals: { lang: 'ar' },
};
