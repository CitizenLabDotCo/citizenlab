import React from 'react';

import { Meta, StoryObj } from '@storybook/react';

import TagChip from '../TagChip';

import PropertyRow from './PropertyRow';

// One labelled line of the input side panel's properties (status,
// assignee, tags, phases): a grey label on the left, the value on the
// right, wrapping when it is long.

const meta = {
  title: 'Components/Redesigned/Input manager/Property row',
  tags: ['bo', 'redesigned'],
  component: PropertyRow,
  args: {
    label: 'Tags',
    children: (
      <>
        <TagChip label="Trees" />
        <TagChip label="Shade" />
      </>
    ),
  },
  decorators: [
    (Story) => (
      <div style={{ width: 592, maxWidth: '100%' }}>
        <Story />
      </div>
    ),
  ],
} satisfies Meta<typeof PropertyRow>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const LongContent: Story = {
  args: {
    label: 'Tags of this input',
    children: (
      <>
        {[
          'Trees',
          'Shade',
          'Schools',
          'Mobility',
          'Green spaces and biodiversity',
          'Water',
          'Lighting',
          'Safety',
        ].map((label) => (
          <TagChip key={label} label={label} />
        ))}
      </>
    ),
  },
};

export const RTL: Story = {
  globals: { lang: 'ar' },
};
