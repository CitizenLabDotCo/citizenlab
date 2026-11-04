import React from 'react';

import { Meta, StoryObj } from '@storybook/react';
import { fn } from 'storybook/test';

import { mockFilterCategories } from '../../../../../../../../.storybook/mocks/backofficeRedesignInputManager';

import FilterChips from './FilterChips';

// The strip above the input list that spells out the filters that are on
// ("Status is any of Proposed"), each with a cross, and "Clear filters".
// It shows nothing when no filter is on.

const meta = {
  title: 'Components/Redesigned/Input manager/Filter chips',
  tags: ['bo', 'redesigned'],
  component: FilterChips,
  args: { categories: mockFilterCategories(true), onClearAll: fn() },
  decorators: [
    (Story) => (
      <div style={{ width: 960, maxWidth: '100%' }}>
        <Story />
      </div>
    ),
  ],
} satisfies Meta<typeof FilterChips>;

export default meta;
type Story = StoryObj<typeof meta>;

/** A status and a tags filter. */
export const Default: Story = {};

/** A single-choice filter reads "is" rather than "is any of". */
export const SingleChoice: Story = {
  args: {
    categories: mockFilterCategories().map((category) =>
      category.key === 'reply'
        ? { ...category, selected: ['awaiting'], isActive: true }
        : category
    ),
  },
};

/** Many filters and values: the chips wrap. */
export const LongContent: Story = {
  args: {
    categories: mockFilterCategories(true).map((category) => ({
      ...category,
      selected: category.options.map((option) => option.value),
      isActive: category.key !== 'phase',
    })),
  },
};

export const RTL: Story = {
  globals: { lang: 'ar' },
};
