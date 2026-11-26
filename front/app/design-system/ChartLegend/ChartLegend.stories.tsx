import ChartLegend from '.';

import type { Meta, StoryObj } from '@storybook/react';

const meta = {
  title: 'Design system/Charts/Chart legend',
  component: ChartLegend,
  args: {
    items: [
      { label: 'Participants', color: 'var(--gv-chart-line-primary)' },
      { label: 'Visitors', color: '#e08a4e' },
    ],
  },
} satisfies Meta<typeof ChartLegend>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};
