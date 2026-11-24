import NewDot from '.';

import type { Meta, StoryObj } from '@storybook/react';

const meta = {
  title: 'Design system/Status & feedback/New dot',
  component: NewDot,
} satisfies Meta<typeof NewDot>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};
