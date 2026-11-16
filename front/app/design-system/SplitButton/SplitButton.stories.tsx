import React from 'react';

import Menu, { MenuItem } from '../Menu';

import SplitButton from '.';

import type { Meta, StoryObj } from '@storybook/react';

const menu = (
  <Menu aria-label="New" placement="bottom end">
    <MenuItem>New folder</MenuItem>
    <MenuItem>Import project</MenuItem>
  </Menu>
);

const meta = {
  title: 'Design system/Actions/SplitButton',
  component: SplitButton,
  args: { children: 'New project', menu },
} satisfies Meta<typeof SplitButton>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const AllVariants: Story = {
  render: () => (
    <div style={{ display: 'grid', gap: 16, justifyItems: 'start' }}>
      {(['primary', 'secondary'] as const).map((variant) =>
        ([28, 32] as const).map((size) => (
          <div
            key={`${variant}-${size}`}
            style={{ display: 'flex', gap: 16, alignItems: 'center' }}
          >
            <SplitButton variant={variant} size={size} menu={menu}>
              New project
            </SplitButton>
            <SplitButton
              variant={variant}
              size={size}
              menu={menu}
              isDisabled
              isMenuDisabled
            >
              New project
            </SplitButton>
          </div>
        ))
      )}
    </div>
  ),
};
