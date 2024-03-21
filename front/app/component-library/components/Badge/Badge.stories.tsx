import { Meta, StoryObj } from '@storybook/react';

import Badge from '.';

const meta = {
  title: 'Components/Badge',
  component: Badge,
} satisfies Meta<typeof Badge>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    children: 'A Badge with label',
  },
};

export const Inverted: Story = {
  args: {
    ...Default.args,
    className: 'inverse',
  },
};
