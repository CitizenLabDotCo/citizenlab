import React from 'react';

import { Menu } from 'react-aria-components';

import SwitchRow, { PopoverSwitchRow } from '.';

import type { Meta, StoryObj } from '@storybook/react';

const meta = {
  title: 'Design system/Forms/Switch row',
  component: SwitchRow,
  args: { id: 'space', children: 'Browse by space and folder' },
} satisfies Meta<typeof SwitchRow>;

export default meta;
type Story = StoryObj<typeof meta>;

export const InMenu: Story = {
  render: () => (
    <div style={{ width: 240 }}>
      <Menu
        aria-label="View"
        selectionMode="multiple"
        defaultSelectedKeys={['folder', 'folder-disabled']}
      >
        <SwitchRow id="space">Browse by space and folder</SwitchRow>
        <SwitchRow id="folder">Browse by space and folder</SwitchRow>
        <SwitchRow id="space-disabled" isDisabled>
          Browse by space and folder
        </SwitchRow>
        <SwitchRow id="folder-disabled" isDisabled>
          Browse by space and folder
        </SwitchRow>
      </Menu>
    </div>
  ),
};

export const InPopover: Story = {
  render: () => (
    <div style={{ width: 240, display: 'flex', flexDirection: 'column' }}>
      <PopoverSwitchRow>Browse by space and folder</PopoverSwitchRow>
      <PopoverSwitchRow defaultSelected>
        Browse by space and folder
      </PopoverSwitchRow>
      <PopoverSwitchRow isDisabled>Browse by space and folder</PopoverSwitchRow>
      <PopoverSwitchRow defaultSelected isDisabled>
        Browse by space and folder
      </PopoverSwitchRow>
    </div>
  ),
};

// Looks disabled, stays focusable; hover or focus shows why. Clicking or Space keeps it
// as it is.
export const PopoverDisabledWithReason: Story = {
  render: () => (
    <div style={{ width: 240, display: 'flex', flexDirection: 'column' }}>
      <PopoverSwitchRow disabledReason="Emails go out only for public projects">
        Email followers
      </PopoverSwitchRow>
    </div>
  ),
};
