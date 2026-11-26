import React from 'react';

import Switch from '.';

import type { Meta, StoryObj } from '@storybook/react';

const meta = {
  title: 'Design system/Forms/Switch',
  component: Switch,
  args: { size: 36, children: 'Allow comments' },
} satisfies Meta<typeof Switch>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const AllVariants: Story = {
  render: () => (
    <div style={{ display: 'grid', gap: 16 }}>
      {([36, 26] as const).map((size) => (
        <div key={size} style={{ display: 'flex', gap: 24 }}>
          <Switch size={size}>Allow comments</Switch>
          <Switch size={size} isSelected>
            Allow comments
          </Switch>
          <Switch size={size} isDisabled>
            Allow comments
          </Switch>
          <Switch size={size} isSelected isDisabled>
            Allow comments
          </Switch>
          <Switch size={size} aria-label="Allow comments" />
          <Switch size={size} aria-label="Allow comments" isSelected />
        </div>
      ))}
    </div>
  ),
};
