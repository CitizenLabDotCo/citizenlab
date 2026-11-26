import React from 'react';

import { PopoverSwitchRow } from '.';

import type { Meta, StoryObj } from '@storybook/react';

const meta = {
  title: 'Design system/Forms/Switch row',
  component: PopoverSwitchRow,
  args: { children: 'Browse by space and folder' },
} satisfies Meta<typeof PopoverSwitchRow>;

export default meta;
type Story = StoryObj<typeof meta>;

export const InPopover: Story = {
  render: () => (
    <div style={{ width: 240, display: 'flex', flexDirection: 'column' }}>
      <PopoverSwitchRow>Browse by space and folder</PopoverSwitchRow>
      <PopoverSwitchRow isSelected>Browse by space and folder</PopoverSwitchRow>
    </div>
  ),
};

// Looks disabled, stays focusable; hover or focus shows why. Clicking or Space keeps it
// as it is.
export const DisabledWithReason: Story = {
  render: () => (
    <div style={{ width: 240, display: 'flex', flexDirection: 'column' }}>
      <PopoverSwitchRow disabledReason="Emails go out only for public projects">
        Email followers
      </PopoverSwitchRow>
    </div>
  ),
};
