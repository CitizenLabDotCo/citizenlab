import React from 'react';

import { Meta, StoryObj } from '@storybook/react';

import Box from '.';

const meta = {
  title: 'Components/Layout/Box',
  tags: ['shared'],
  parameters: { gv: {} },
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

export const LongContent: Story = {
  args: {
    ...Default.args,
    width: '320px',
    children: (
      <div>
        A very long line of content that keeps going without any break so that
        it has to wrap inside the box:
        participants_can_submit_ideas_comment_and_vote_on_the_ones_they_want_to_see_next
      </div>
    ),
  },
};

export const RTL: Story = {
  args: Default.args,
  render: (args) => (
    <div dir="rtl">
      <Box {...args}>
        <div>مرحبا، أنا العنصر الأول داخل هذا الصندوق</div>
        <div>مرحبا، أنا العنصر الثاني داخل هذا الصندوق</div>
      </Box>
    </div>
  ),
};
