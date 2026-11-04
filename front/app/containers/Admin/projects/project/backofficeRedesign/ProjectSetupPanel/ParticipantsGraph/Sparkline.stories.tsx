import React from 'react';

import { Text } from '@citizenlab/cl2-component-library';
import { Meta, StoryObj } from '@storybook/react';

import Sparkline from './Sparkline';

// The small line chart in the participants card: one point per week,
// scaled to the busiest week, with a light fill under the line.

const meta = {
  title: 'Components/Redesigned/Setup panel/Sparkline',
  tags: ['bo', 'redesigned'],
  component: Sparkline,
  args: { values: [1, 2, 2, 4, 3, 6, 5, 8] },
  decorators: [
    (Story) => (
      <div style={{ width: 268, background: 'white' }}>
        <Text variant="boMicro" mb="8px">
          Participants per week
        </Text>
        <Story />
      </div>
    ),
  ],
} satisfies Meta<typeof Sparkline>;

export default meta;
type Story = StoryObj<typeof meta>;

/** Eight weeks, mostly growing. */
export const Default: Story = {};

/** A busy start that fades out. */
export const Falling: Story = {
  args: { values: [9, 7, 8, 4, 3, 2, 2, 1] },
};

/** Nobody yet: a flat line along the bottom. */
export const Flat: Story = {
  args: { values: [0, 0, 0, 0, 0, 0] },
};

/** Half a year of weeks. */
export const LongContent: Story = {
  args: {
    values: [
      0, 1, 1, 3, 2, 5, 4, 4, 7, 6, 9, 12, 10, 8, 11, 14, 13, 9, 7, 10, 12,
      15, 18, 16, 20, 17,
    ],
  },
};
