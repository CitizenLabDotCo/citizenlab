import React from 'react';

import Switch from '.';

import type { Meta, StoryObj } from '@storybook/react';

const meta = {
  title: 'Design system/Forms/Switch',
  component: Switch,
  args: { children: 'Allow comments' },
} satisfies Meta<typeof Switch>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const AllVariants: Story = {
  render: () => (
    <div style={{ display: 'grid', gap: 16 }}>
      {([36, 28, 26] as const).map((size) => (
        <div key={size} style={{ display: 'flex', gap: 24 }}>
          <Switch size={size}>Allow comments</Switch>
          <Switch size={size} defaultSelected>
            Allow comments
          </Switch>
          <Switch size={size} isDisabled>
            Allow comments
          </Switch>
          <Switch size={size} defaultSelected isDisabled>
            Allow comments
          </Switch>
          <Switch size={size} aria-label="Allow comments" />
          <Switch size={size} aria-label="Allow comments" defaultSelected />
        </div>
      ))}
    </div>
  ),
};

// Looks disabled, stays focusable; hover or focus shows why. Clicking or Space keeps it
// as it is.
export const DisabledWithReason: Story = {
  render: () => (
    <div style={{ display: 'grid', gap: 16, justifyItems: 'start' }}>
      <Switch disabledReason="No participants have an email address">
        Email participants
      </Switch>
      <Switch
        defaultSelected
        aria-label="Email participants"
        disabledReason="No participants have an email address"
      />
    </div>
  ),
};
