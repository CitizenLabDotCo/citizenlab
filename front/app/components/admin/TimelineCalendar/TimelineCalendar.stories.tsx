import React, { useState } from 'react';

import TimelineCalendar from './';

import type { Meta } from '@storybook/react';

const meta = {
  title: 'TimelineCalendar',
  component: TimelineCalendar,
  parameters: {
    chromatic: { disableSnapshot: false },
  },
} satisfies Meta<typeof TimelineCalendar>;

export default meta;
// type Story = StoryObj<typeof meta>;

const INITIAL_PHASES = [
  { from: new Date('2024-08-01'), to: new Date('2024-09-05') },
  { from: new Date('2024-09-10'), to: new Date('2024-09-20') },
  { from: new Date('2024-09-21'), to: new Date('2024-10-28') },
];

const Wrapper = () => {
  const [phases, setPhases] = useState(INITIAL_PHASES);

  return (
    <TimelineCalendar
      phases={phases}
      selectedPhaseIndex={1}
      onUpdatePhases={setPhases}
    />
  );
};

export const Standard = {
  render: () => {
    return <Wrapper />;
  },
};
