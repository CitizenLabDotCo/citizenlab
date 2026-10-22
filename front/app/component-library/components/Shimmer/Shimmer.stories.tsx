import Shimmer from '.';

import type { Meta, StoryObj } from '@storybook/react';

const meta = {
  title: 'Components/Feedback/Shimmer',
  tags: ['shared'],
  parameters: { gv: {} },
  component: Shimmer,
} satisfies Meta<typeof Shimmer>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    width: '320px',
    height: '24px',
  },
};
