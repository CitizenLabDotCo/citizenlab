import React from 'react';

import Avatar from '../Avatar';

import CommentRow, { CommentAction } from '.';

import type { Meta, StoryObj } from '@storybook/react';

const meta = {
  title: 'Design system/Data display/CommentRow',
  component: CommentRow,
  args: {
    avatar: <Avatar size={24} initials="N" tone="muted" />,
    name: 'Nadia K.',
    time: 'Today',
    children: 'Not sure about this. The path is already crowded at weekends.',
    actions: (
      <>
        <CommentAction onPress={() => {}}>Reply</CommentAction>
        <CommentAction onPress={() => {}}>Delete</CommentAction>
      </>
    ),
  },
} satisfies Meta<typeof CommentRow>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const Reply: Story = { args: { isReply: true } };
