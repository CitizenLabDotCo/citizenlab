import React from 'react';

import { Meta, StoryObj } from '@storybook/react';
import { fn, userEvent, within } from 'storybook/test';

import OptionList from '.';

// The list sits in a dropdown in the back office; the frame gives it a
// dropdown's width.
const meta = {
  title: 'Components/Forms/OptionList',
  tags: ['bo'],
  parameters: { gv: {} },
  component: OptionList,
  args: {
    options: [
      { value: 'new', label: 'New' },
      { value: 'review', label: 'Under review' },
      { value: 'accepted', label: 'Accepted' },
      { value: 'rejected', label: 'Rejected' },
    ],
    selected: [],
    onToggle: fn(),
    searchPlaceholder: 'Filter…',
    noMatchesText: 'Nothing matches your search',
  },
  decorators: [
    (Story) => (
      <div style={{ width: 'calc(var(--gv-space-24) * 3)' }}>
        <Story />
      </div>
    ),
  ],
} satisfies Meta<typeof OptionList>;

export default meta;
type Story = StoryObj<typeof meta>;

const manyOptions = [
  'Budget',
  'Climate',
  'Culture',
  'Education',
  'Health',
  'Housing',
  'Mobility',
  'Safety',
  'Sports',
  'Youth',
].map((label) => ({ value: label.toLowerCase(), label }));

export const Default: Story = {};

export const Selected: Story = {
  args: { selected: ['review', 'accepted'] },
};

/** Some of the selected inputs have the option: the box shows a dash. */
export const Partial: Story = {
  args: {
    options: [
      { value: 'new', label: 'New' },
      { value: 'review', label: 'Under review', partial: true },
      { value: 'accepted', label: 'Accepted' },
      { value: 'rejected', label: 'Rejected', partial: true },
    ],
  },
};

export const WithColors: Story = {
  args: {
    options: [
      { value: 'new', label: 'New', color: 'var(--gv-blue-500)' },
      { value: 'review', label: 'Under review', color: 'var(--gv-orange-500)' },
      { value: 'accepted', label: 'Accepted', color: 'var(--gv-green-500)' },
      { value: 'rejected', label: 'Rejected', color: 'var(--gv-red-500)' },
    ],
  },
};

export const WithCounts: Story = {
  args: {
    options: [
      { value: 'new', label: 'New', count: 12 },
      { value: 'review', label: 'Under review', count: 4 },
      { value: 'accepted', label: 'Accepted', count: 31 },
      { value: 'rejected', label: 'Rejected', count: 0 },
    ],
  },
};

export const Disabled: Story = {
  args: {
    options: [
      { value: 'new', label: 'New' },
      {
        value: 'review',
        label: 'Under review',
        disabled: true,
        disabledReason: 'Only admins can set this status',
      },
      { value: 'accepted', label: 'Accepted', disabled: true },
      { value: 'rejected', label: 'Rejected' },
    ],
  },
};

export const Hover: Story = {
  parameters: { pseudo: { hover: ['button'] } },
};

/** Nine options or more: a search field filters the list. */
export const Searchable: Story = {
  args: { options: manyOptions },
};

export const Empty: Story = {
  args: { options: manyOptions },
  play: async ({ canvasElement }) => {
    await userEvent.type(within(canvasElement).getByRole('textbox'), 'zzz');
  },
};

export const LongContent: Story = {
  args: {
    options: [
      {
        value: 'a',
        label:
          'Improve the cycling lanes on the main road between the station and the market square',
        count: 128,
      },
      { value: 'b', label: 'Plant more trees', count: 3 },
    ],
    selected: ['a'],
  },
};

export const RTL: Story = {
  globals: { lang: 'ar' },
  args: {
    options: [
      { value: 'new', label: 'جديد', count: 12, color: 'var(--gv-blue-500)' },
      { value: 'review', label: 'قيد المراجعة', count: 4 },
      { value: 'accepted', label: 'مقبول', count: 31 },
    ],
    selected: ['review'],
  },
};
