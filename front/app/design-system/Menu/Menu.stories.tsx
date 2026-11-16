import React from 'react';

import { Menu as AriaMenu } from 'react-aria-components';

import Button from '../Button';
import surfaces from '../surfaces.module.css';

import Menu, { MenuItem, MenuSeparator, MenuTrigger, SubmenuTrigger } from '.';

import type { Meta, StoryObj } from '@storybook/react';

const meta = {
  title: 'Design system/Overlays/Menu',
  component: Menu,
} satisfies Meta<typeof Menu>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: { children: null },
  render: () => (
    <MenuTrigger defaultOpen>
      <Button hasMenu>Actions</Button>
      <Menu aria-label="Project actions">
        <MenuItem icon="eye-16">Open preview</MenuItem>
        <MenuItem icon="link-16">Copy link</MenuItem>
        <MenuItem icon="copy-16">Duplicate</MenuItem>
        <MenuItem icon="download-16">Download</MenuItem>
        <MenuSeparator />
        <MenuItem icon="x-16" variant="danger">
          Delete
        </MenuItem>
      </Menu>
    </MenuTrigger>
  ),
};

const statuses = [
  { id: 'proposed', label: 'Proposed', count: 18 },
  { id: 'review', label: 'Under review', count: 6 },
  { id: 'accepted', label: 'Accepted', count: 4 },
  { id: 'rejected', label: 'Rejected', count: 2 },
];

const Facet = () => (
  <Menu
    aria-label="Status"
    selectionMode="multiple"
    defaultSelectedKeys={new Set(['proposed'])}
  >
    {statuses.map((status) => (
      <MenuItem
        key={status.id}
        id={status.id}
        icon="circle-dashed-1-16"
        count={status.count}
      >
        {status.label}
      </MenuItem>
    ))}
  </Menu>
);

export const WithSubmenu: Story = {
  args: { children: null },
  render: () => (
    <MenuTrigger defaultOpen>
      <Button hasMenu icon="funnel-16">
        Filter
      </Button>
      <Menu aria-label="Filter">
        <SubmenuTrigger>
          <MenuItem icon="circle-dashed-1-16">Status</MenuItem>
          <Facet />
        </SubmenuTrigger>
        <SubmenuTrigger>
          <MenuItem icon="info-16">Assignee</MenuItem>
          <Facet />
        </SubmenuTrigger>
        <SubmenuTrigger>
          <MenuItem icon="plus-16">Tags</MenuItem>
          <Facet />
        </SubmenuTrigger>
        <MenuSeparator />
        <MenuItem icon="x-16" variant="danger">
          Clear filters
        </MenuItem>
      </Menu>
    </MenuTrigger>
  ),
};

// The Menu item grid, drawn in a menu without a popover so every row stays on screen.
// Hovered, Pressed and Focused are live: point at or tab to a row.
const ItemColumn = ({
  selectionMode,
}: {
  selectionMode: 'single' | 'multiple';
}) => (
  <div className={surfaces.dropdown} style={{ width: 240, padding: 6 }}>
    <AriaMenu
      aria-label={`Mark ${selectionMode}`}
      selectionMode={selectionMode}
      defaultSelectedKeys={['selected', 'selected-disabled']}
      disabledKeys={['disabled', 'selected-disabled', 'danger-disabled']}
    >
      <MenuItem id="default" icon="copy-16">
        Duplicate
      </MenuItem>
      <MenuItem id="disabled" icon="copy-16">
        Duplicate
      </MenuItem>
      <MenuItem id="selected" icon="copy-16">
        Duplicate
      </MenuItem>
      <MenuItem id="selected-disabled" icon="copy-16">
        Duplicate
      </MenuItem>
      <MenuItem
        id="description"
        icon="copy-16"
        description="Most reactions in the last days"
      >
        Duplicate
      </MenuItem>
      <MenuItem id="count" icon="copy-16" count={12}>
        Duplicate
      </MenuItem>
      <MenuItem id="danger" icon="copy-16" variant="danger">
        Duplicate
      </MenuItem>
      <MenuItem id="danger-disabled" icon="copy-16" variant="danger">
        Duplicate
      </MenuItem>
    </AriaMenu>
  </div>
);

export const MenuItems: Story = {
  args: { children: null },
  render: () => (
    <div style={{ display: 'flex', gap: 24, alignItems: 'flex-start' }}>
      <ItemColumn selectionMode="single" />
      <ItemColumn selectionMode="multiple" />
    </div>
  ),
};

// Download looks disabled but stays focusable: the arrow keys reach it and the tooltip
// says why; clicking it or Enter does nothing and the menu stays open.
export const DisabledWithReason: Story = {
  args: { children: null },
  render: () => (
    <MenuTrigger defaultOpen>
      <Button hasMenu>Actions</Button>
      <Menu
        aria-label="Project actions"
        onAction={(key) => window.alert(`action ${String(key)}`)}
      >
        <MenuItem id="preview" icon="eye-16">
          Open preview
        </MenuItem>
        <MenuItem
          id="download"
          icon="download-16"
          disabledReason="Nobody signed up yet"
        >
          Download
        </MenuItem>
        <MenuItem id="copy" icon="copy-16">
          Duplicate
        </MenuItem>
      </Menu>
    </MenuTrigger>
  ),
};
