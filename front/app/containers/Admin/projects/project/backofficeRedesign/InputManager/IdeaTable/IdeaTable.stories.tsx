import React from 'react';

import { Meta, StoryObj } from '@storybook/react';
import { fn } from 'storybook/test';

import { ideaStatusesData } from 'api/idea_statuses/__mocks__/_mockServer';

import {
  backofficeRedesignHandlers,
  mockIdeas,
  waitForText,
} from '../../../../../../../../.storybook/mocks/backofficeRedesign';

import IdeaTable from '.';

// The list of inputs in the input manager: one row per input with its
// status, assignee and counts, sortable columns and row selection.

const meta = {
  title: 'Components/Redesigned/Idea table',
  tags: ['bo'],
  component: IdeaTable,
  parameters: { msw: backofficeRedesignHandlers },
  args: {
    ideas: mockIdeas,
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
    ],
    onChangeColumns: fn(),
    sort: 'new',
    onSort: fn(),
    statuses: ideaStatusesData,
    tagLabels: new Map(),
    selectedIds: new Set(),
    onToggleSelect: fn(),
    onToggleSelectPage: fn(),
    openIdeaId: undefined,
    onOpen: fn(),
    currentPage: 1,
    lastPage: 1,
    onChangePage: fn(),
  },
  decorators: [
    (Story) => (
      <div style={{ width: 960, maxWidth: '100%', background: 'white' }}>
        <Story />
      </div>
    ),
  ],
  play: async ({ canvasElement }) => {
    await waitForText(canvasElement, 'Plant oaks along the canal');
  },
} satisfies Meta<typeof IdeaTable>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};

/** One row selected, and one open in the side panel. */
export const Selected: Story = {
  args: {
    selectedIds: new Set([mockIdeas[0].id]),
    openIdeaId: mockIdeas[1].id,
  },
};

/** More than one page of inputs. */
export const Paged: Story = {
  args: { currentPage: 2, lastPage: 4 },
};

export const RTL: Story = {
  globals: { lang: 'ar' },
};
