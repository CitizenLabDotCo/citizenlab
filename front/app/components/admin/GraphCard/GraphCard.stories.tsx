import React from 'react';

import { Box } from '@citizenlab/cl2-component-library';
import { Meta, StoryObj } from '@storybook/react';
import { fn } from 'storybook/test';

import GraphCard from '.';

// The dashboard card around a graph. A plain bar block stands in for the
// chart.
const Bars = () => (
  <Box display="flex" alignItems="flex-end" gap="12px" height="160px" px="20px">
    {[40, 90, 65, 120, 80].map((h) => (
      <Box key={h} width="32px" height={`${h}px`} bg="#2f6fb1" />
    ))}
  </Box>
);

const meta = {
  title: 'Components/Data display/GraphCard',
  tags: ['bo'],
  parameters: { gv: {} },
  component: GraphCard,
  args: { title: 'Registrations', children: <Bars /> },
  render: (args) => (
    <Box width="640px" bg="#f4f4f6">
      <GraphCard {...args} />
    </Box>
  ),
} satisfies Meta<typeof GraphCard>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const WithInfoTooltip: Story = {
  args: { infoTooltipContent: 'People who completed sign-up.' },
};

// Switches between the chart and a table.
export const WithViewToggle: Story = {
  args: { viewToggle: { view: 'chart', onChangeView: fn() } },
};

export const WithTopRightStat: Story = {
  args: { topRightStat: '1,204 total' },
};

export const RTL: Story = {
  globals: { lang: 'ar' },
  args: { title: 'التسجيلات' },
};
