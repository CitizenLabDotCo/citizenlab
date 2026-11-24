import React from 'react';

import BarRow from '../BarRow';

import ExpandableRow from '.';

import type { Meta, StoryObj } from '@storybook/react';

const meta = {
  title: 'Design system/Charts/Expandable row',
  component: ExpandableRow,
  args: { title: 'AI topic distribution', children: null },
  decorators: [
    (Story) => (
      <div style={{ width: 281 }}>
        <Story />
      </div>
    ),
  ],
} satisfies Meta<typeof ExpandableRow>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  render: () => (
    <div>
      <ExpandableRow
        title="AI topic distribution"
        summary="34 inputs · 2 topics"
      >
        <BarRow label="Safety" value="62% · 21" share={0.62} />
        <BarRow label="Play areas" value="38% · 13" share={0.38} />
      </ExpandableRow>
      <ExpandableRow
        title="Manual tags by participants"
        summary="78 inputs · 37 topics"
        defaultExpanded
      >
        <BarRow label="Nature" value="18% · 14" share={0.18} />
      </ExpandableRow>
    </div>
  ),
};
