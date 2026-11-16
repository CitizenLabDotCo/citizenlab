import React from 'react';

import SectionLabel from '.';

import type { Meta, StoryObj } from '@storybook/react';

const meta = {
  title: 'Design system/Text/Section label',
  component: SectionLabel,
  args: { children: 'Timeline' },
  decorators: [
    (Story) => (
      <div style={{ width: 264 }}>
        <Story />
      </div>
    ),
  ],
} satisfies Meta<typeof SectionLabel>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};
