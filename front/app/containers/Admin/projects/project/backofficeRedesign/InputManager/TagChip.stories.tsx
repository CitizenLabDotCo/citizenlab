import React from 'react';

import { Meta, StoryObj } from '@storybook/react';
import { fn } from 'storybook/test';

import TagChip from './TagChip';

// A small grey chip with a tag or phase name, used in the input list and
// the side panel. In the side panel it has a cross to remove it.

const meta = {
  title: 'Components/Redesigned/Input manager/Tag chip',
  tags: ['bo', 'redesigned'],
  component: TagChip,
  args: { label: 'Trees' },
  decorators: [
    (Story) => (
      <div style={{ display: 'flex' }}>
        <Story />
      </div>
    ),
  ],
} satisfies Meta<typeof TagChip>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};

/** As in the side panel: with a cross to remove the tag. */
export const Removable: Story = {
  args: { onRemove: fn(), removeLabel: 'Remove tag Trees' },
};

export const LongContent: Story = {
  args: {
    label: 'Green spaces and urban biodiversity',
    onRemove: fn(),
    removeLabel: 'Remove tag',
  },
};

export const RTL: Story = {
  args: { label: 'أشجار', onRemove: fn(), removeLabel: 'إزالة' },
  globals: { lang: 'ar' },
};
