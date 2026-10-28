import React from 'react';

import { Meta, StoryObj } from '@storybook/react';

import StatTile from './StatTile';

// One number tile of the input manager's right column: a big figure with
// a label under it.

const meta = {
  title: 'Components/Redesigned/Input manager/Stat tile',
  tags: ['bo', 'redesigned'],
  component: StatTile,
  args: { value: 12, label: 'Inputs' },
  decorators: [
    (Story) => (
      <div style={{ width: 110, display: 'flex' }}>
        <Story />
      </div>
    ),
  ],
} satisfies Meta<typeof StatTile>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const LongContent: Story = {
  args: { value: 128450, label: 'Responded to by the team' },
};

export const RTL: Story = {
  args: { label: 'مدخلات' },
  globals: { lang: 'ar' },
};
