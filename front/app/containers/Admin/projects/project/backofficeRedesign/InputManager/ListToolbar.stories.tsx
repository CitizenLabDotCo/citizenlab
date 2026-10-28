import React from 'react';

import { Meta, StoryObj } from '@storybook/react';
import { fn } from 'storybook/test';

import { project1 } from 'api/projects/__mocks__/_mockServer';

import {
  inputManagerHandlers,
  managedIdeas,
  mockFilterCategories,
} from '../../../../../../../.storybook/mocks/backofficeRedesignInputManager';

import ListToolbar from './ListToolbar';

// The bar above the input list: the number of inputs (or, once inputs are
// selected, the batch actions), with search and filter on the right.

const meta = {
  title: 'Components/Redesigned/Input manager/List toolbar',
  tags: ['bo', 'redesigned'],
  component: ListToolbar,
  parameters: { msw: inputManagerHandlers },
  args: {
    type: 'ProjectIdeas',
    projectId: project1.id,
    count: 12,
    selectedIdeas: [],
    onUpdated: fn(),
    onEdit: fn(),
    onClearSelection: fn(),
    searchTerm: undefined,
    onSearch: fn(),
    categories: mockFilterCategories(),
    onClearFilters: fn(),
  },
  decorators: [
    (Story) => (
      <div style={{ width: 960, maxWidth: '100%' }}>
        <Story />
      </div>
    ),
  ],
} satisfies Meta<typeof ListToolbar>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};

/** Two inputs selected: the batch actions replace the count. */
export const WithSelection: Story = {
  args: { selectedIdeas: managedIdeas },
};

/** A search and filters are on. */
export const Filtered: Story = {
  args: {
    count: 3,
    searchTerm: 'canal',
    categories: mockFilterCategories(true),
  },
};

export const RTL: Story = {
  globals: { lang: 'ar' },
};
