import React from 'react';

import { Meta, StoryObj } from '@storybook/react';

import { colors } from '../../utils/styleUtils';

import Spinner from './';

const meta = {
  title: 'Components/Feedback/Spinner',
  tags: ['shared'],
  parameters: { gv: {} },
  component: Spinner,
} satisfies Meta<typeof Spinner>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    size: '32px',
    thickness: '3px',
    color: colors.grey700,
  },
};

export const Loading: Story = {
  args: Default.args,
  render: (args) => (
    <div role="status" aria-label="Loading ideas">
      <Spinner {...args} />
    </div>
  ),
};
