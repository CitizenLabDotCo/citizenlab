import TimelineCalendar from './';

import type { Meta, StoryObj } from '@storybook/react';

const meta = {
  title: 'TimelineCalendar',
  component: TimelineCalendar,
  parameters: {
    chromatic: { disableSnapshot: false },
  },
} satisfies Meta<typeof TimelineCalendar>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Standard: Story = {
  args: {
    phases: [
      { from: new Date('2024-08-01'), to: new Date('2024-09-05') },
      { from: new Date('2024-09-10'), to: new Date('2024-09-20') },
      { from: new Date('2024-09-21'), to: new Date('2024-10-28') },
    ],
    selectedPhaseIndex: 1,
  },
};
