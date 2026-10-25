import React from 'react';

import { Table } from '@citizenlab/cl2-component-library';
import { Meta, StoryObj } from '@storybook/react';
import { fn } from 'storybook/test';

import HeaderRow from './HeaderRow';

// The header of the input list: select-all checkbox, sortable column
// titles and the plus to add columns.

const meta = {
  title: 'Components/Redesigned/Input manager/Header row',
  tags: ['bo', 'redesigned'],
  component: HeaderRow,
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
    ],
    onChangeColumns: fn(),
    sort: 'new',
    onSort: fn(),
    allSelected: false,
    someSelected: false,
    onToggleSelectAll: fn(),
  },
  decorators: [
    (Story) => (
      <div style={{ width: 960, maxWidth: '100%', background: 'white' }}>
        <Table>
          <Story />
        </Table>
      </div>
    ),
  ],
} satisfies Meta<typeof HeaderRow>;

export default meta;
type Story = StoryObj<typeof meta>;

/** Newest first. */
export const Default: Story = {};

/** Sorted by likes, fewest first. */
export const SortedAscending: Story = {
  args: { sort: '-likes_count' },
};

/** Some rows on the page are selected. */
export const SomeSelected: Story = {
  args: { someSelected: true },
};

export const AllSelected: Story = {
  args: { someSelected: true, allSelected: true },
};

/** Only the input titles. */
export const Minimal: Story = {
  args: { columns: [] },
};

export const RTL: Story = {
  globals: { lang: 'ar' },
};
