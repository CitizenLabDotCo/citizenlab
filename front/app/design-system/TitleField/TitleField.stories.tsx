import React from 'react';

import TitleField from '.';

import type { Meta, StoryObj } from '@storybook/react';

const meta = {
  title: 'Design system/Forms/Title field',
  component: TitleField,
  args: { 'aria-label': 'Phase title', placeholder: 'Add a title' },
  decorators: [
    (Story) => (
      <div style={{ width: 444 }}>
        <Story />
      </div>
    ),
  ],
} satisfies Meta<typeof TitleField>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};
