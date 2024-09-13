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
  args: {},
};
