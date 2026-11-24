import React from 'react';

import BarRow from '.';

import type { Meta, StoryObj } from '@storybook/react';

const meta = {
  title: 'Design system/Charts/Bar row',
  component: BarRow,
  args: { label: 'Proposed', value: '18% · 6', share: 0.18 },
  decorators: [
    (Story) => (
      <div style={{ width: 732 }}>
        <Story />
      </div>
    ),
  ],
} satisfies Meta<typeof BarRow>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const Shares: Story = {
  render: () => (
    <div>
      <BarRow label="Proposed" value="0% · 0" share={0} />
      <BarRow label="Viewed" value="30% · 10" share={0.3} />
      <BarRow label="Accepted" value="100% · 34" share={1} />
    </div>
  ),
};
