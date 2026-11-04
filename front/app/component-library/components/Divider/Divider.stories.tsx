import Divider from '.';

import type { Meta, StoryObj } from '@storybook/react';

const meta = {
  title: 'Components/Layout/Divider',
  tags: ['shared'],
  parameters: { gv: {} },
  component: Divider,
} satisfies Meta<typeof Divider>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {},
};
