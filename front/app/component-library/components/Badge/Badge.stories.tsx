import React from 'react';

import { Meta, StoryObj } from '@storybook/react';

import Badge from '.';

const meta = {
  title: 'Components/Data display/Badge',
  tags: ['shared'],
  parameters: { gv: {} },
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

export const LongContent: Story = {
  args: {
    children:
      'Selected for the participatory budget of the northern district in the spring round',
  },
  render: (args) => (
    <div style={{ width: '240px' }}>
      <Badge {...args} />
    </div>
  ),
};
