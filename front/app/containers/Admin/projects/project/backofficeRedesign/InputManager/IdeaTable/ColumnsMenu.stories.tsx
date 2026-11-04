import React from 'react';

import { Meta, StoryObj } from '@storybook/react';
import { fn, userEvent, within } from 'storybook/test';

import ColumnsMenu from './ColumnsMenu';

// The plus at the end of the input list's header row and the menu it
// opens, to show or hide columns.

const meta = {
  title: 'Components/Redesigned/Input manager/Columns menu',
  tags: ['bo', 'redesigned'],
  component: ColumnsMenu,
  args: {
    columns: ['status', 'assignee', 'tags', 'likes', 'comments', 'published'],
    availableColumns: [
      'status',
      'assignee',
      'tags',
      'likes',
      'dislikes',
      'comments',
      'published',
      'replied',
      'imported',
    ],
    onChange: fn(),
  },
  decorators: [
    (Story) => (
      <div
        style={{
          display: 'flex',
          justifyContent: 'flex-end',
          width: 320,
          minHeight: 380,
        }}
      >
        <Story />
      </div>
    ),
  ],
} satisfies Meta<typeof ColumnsMenu>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  play: async ({ canvasElement }) => {
    await userEvent.click(
      within(canvasElement).getByRole('button', {
        name: /Add columns|إضافة أعمدة/,
      })
    );
  },
};

/** A voting phase offers its own columns. */
export const Voting: Story = {
  args: {
    columns: ['status', 'votes', 'offlineVotes'],
    availableColumns: [
      'status',
      'assignee',
      'tags',
      'votes',
      'offlineVotes',
      'comments',
      'published',
    ],
  },
  play: Default.play,
};

export const RTL: Story = {
  globals: { lang: 'ar' },
  play: Default.play,
};
