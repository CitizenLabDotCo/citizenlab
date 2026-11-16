import React from 'react';

import SearchField from '.';

import type { Meta, StoryObj } from '@storybook/react';

const meta = {
  title: 'Design system/Forms/Search field',
  component: SearchField,
  args: { 'aria-label': 'Search projects', placeholder: 'Search projects' },
} satisfies Meta<typeof SearchField>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};

// Hovered and Focused come from the pointer and keyboard.
export const AllVariants: Story = {
  render: () => (
    <div style={{ display: 'grid', gap: 24 }}>
      {([32, 36] as const).map((size) =>
        ([undefined, 'park'] as const).map((value) => (
          <div key={`${size}-${value}`} style={{ display: 'flex', gap: 24 }}>
            <SearchField
              aria-label="Search projects"
              placeholder="Search projects"
              defaultValue={value}
              size={size}
            />
            <SearchField
              aria-label="Search projects"
              placeholder="Search projects"
              defaultValue={value}
              size={size}
              isDisabled
            />
          </div>
        ))
      )}
    </div>
  ),
};
