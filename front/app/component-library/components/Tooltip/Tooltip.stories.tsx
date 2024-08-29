import React from 'react';

import { Meta, StoryObj } from '@storybook/react';

import Tooltip from './';

const meta = {
  title: 'Components/Tooltip',
  component: Tooltip,
} satisfies Meta<typeof Tooltip>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    content: 'This is a tooltip',
    children: <p>Hover over me</p>,
  },
};
