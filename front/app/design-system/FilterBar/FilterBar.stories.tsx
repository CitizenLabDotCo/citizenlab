import React from 'react';

import Menu, { MenuItem } from '../Menu';

import FilterBar, { FilterChip } from '.';

import type { Meta, StoryObj } from '@storybook/react';

const statusMenu = (
  <Menu aria-label="Status" selectionMode="single">
    <MenuItem id="published">Published</MenuItem>
    <MenuItem id="draft">Draft</MenuItem>
    <MenuItem id="archived">Archived</MenuItem>
  </Menu>
);

const facetMenu = (
  <Menu aria-label="Add filter">
    <MenuItem id="status">Status</MenuItem>
    <MenuItem id="method">Method</MenuItem>
    <MenuItem id="manager">Manager</MenuItem>
  </Menu>
);

const meta = {
  title: 'Design system/Data display/Filter bar',
  component: FilterBar,
  args: {
    addFilterMenu: facetMenu,
    count: '24 projects',
    onClear: () => {},
  },
} satisfies Meta<typeof FilterBar>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  render: (args) => (
    <div style={{ width: 1080 }}>
      <FilterBar
        addFilterMenu={args.addFilterMenu}
        count={args.count}
        onClear={args.onClear}
      >
        <FilterChip
          label="Status: Published"
          menu={statusMenu}
          onRemove={() => {}}
        />
        <FilterChip
          label="Method: Ideation"
          menu={statusMenu}
          onRemove={() => {}}
        />
      </FilterBar>
    </div>
  ),
};

export const Chips: Story = {
  render: () => (
    <div style={{ display: 'flex', gap: 16, alignItems: 'center' }}>
      <FilterChip
        label="Status: Published"
        menu={statusMenu}
        onRemove={() => {}}
      />
      <FilterChip
        label="Folder: A very long folder name that cuts off at the maximum width"
        menu={statusMenu}
        onRemove={() => {}}
      />
    </div>
  ),
};
