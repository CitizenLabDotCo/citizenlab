import React from 'react';

import { Meta, StoryObj } from '@storybook/react';

import Box from '.';

const meta = {
  title: 'Components/Box',
  component: Box,
} satisfies Meta<typeof Box>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    bgColor: '#fff',
    color: '#333',
    children: (
      <>
        <div>Hi, I am the first child of this Box!</div>
        <div>Hi, I am the second child of this Box!</div>
      </>
    ),
  },
};
