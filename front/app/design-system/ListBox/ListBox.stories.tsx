import React from 'react';

import surfaces from '../surfaces.module.css';

import styles from './ListBox.module.css';

import ListBox, { ListBoxOption } from '.';

import type { Meta, StoryObj } from '@storybook/react';

const meta = {
  title: 'Design system/Forms/ListBox',
  component: ListBox,
} satisfies Meta<typeof ListBox>;

export default meta;
type Story = StoryObj<typeof meta>;

// The surface Select and ComboBox open, drawn in place.
const Surface = ({ children }: { children: React.ReactNode }) => (
  <div className={`${surfaces.dropdown} ${styles.popover}`}>{children}</div>
);

const sorts = ['Trending', 'Most voted', 'Most discussed', 'Newest', 'Oldest'];

export const Default: Story = {
  args: { children: null },
  render: () => (
    <Surface>
      <ListBox
        aria-label="Sorting"
        selectionMode="single"
        selectedKeys={new Set(['Trending'])}
      >
        {[...sorts, 'Random'].map((sort) => (
          <ListBoxOption key={sort} id={sort}>
            {sort}
          </ListBoxOption>
        ))}
      </ListBox>
    </Surface>
  ),
};

// Selected No / Yes and Default / Disabled for each mark. Hover or tab in for Hovered and Focused.
export const Options: Story = {
  args: { children: null },
  render: () => (
    <div style={{ display: 'flex', gap: 24, alignItems: 'flex-start' }}>
      {(['single', 'multiple'] as const).map((selectionMode) => (
        <div key={selectionMode} style={{ width: 228 }}>
          <ListBox
            aria-label={selectionMode === 'single' ? 'Check' : 'Checkbox'}
            selectionMode={selectionMode}
            selectedKeys={new Set(['yes', 'yes-disabled'])}
            disabledKeys={['no-disabled', 'yes-disabled']}
          >
            <ListBoxOption id="no">Trending</ListBoxOption>
            <ListBoxOption id="yes">Trending</ListBoxOption>
            <ListBoxOption id="no-disabled">Trending</ListBoxOption>
            <ListBoxOption id="yes-disabled">Trending</ListBoxOption>
            <ListBoxOption id="icon" icon="tag-16">
              Trending
            </ListBoxOption>
          </ListBox>
        </div>
      ))}
    </div>
  ),
};

// Oldest looks disabled but stays focusable: the arrow keys reach it and the tooltip
// says why; clicking it, Space or Enter keeps the selection.
export const DisabledWithReason: Story = {
  args: { children: null },
  render: () => (
    <Surface>
      <ListBox
        aria-label="Sorting"
        selectionMode="single"
        selectedKeys={new Set(['Trending'])}
      >
        {sorts.map((sort) => (
          <ListBoxOption
            key={sort}
            id={sort}
            disabledReason={
              sort === 'Oldest' ? 'Only for phases with an end date' : undefined
            }
          >
            {sort}
          </ListBoxOption>
        ))}
      </ListBox>
    </Surface>
  ),
};
