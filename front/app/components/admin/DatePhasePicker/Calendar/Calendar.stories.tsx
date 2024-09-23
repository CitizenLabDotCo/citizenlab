import React, { useState } from 'react';

import { DateRange } from './typings';

import Calendar from '.';

import type { Meta } from '@storybook/react';

const meta = {
  title: 'Calendar',
  component: Calendar,
  parameters: {
    chromatic: { disableSnapshot: false },
  },
} satisfies Meta<typeof Calendar>;

export default meta;
// type Story = StoryObj<typeof meta>;

const DISABLED_RANGES = [
  { from: new Date('2024-08-01'), to: new Date('2024-09-05') },
  // { from: new Date('2024-09-21'), to: new Date('2024-10-28') },
  { from: new Date('2024-09-21') },
];

const Wrapper = () => {
  const [selectedRange, setSelectedRange] = useState<DateRange>({
    from: new Date('2024-09-10'),
    to: new Date('2024-09-20'),
  });

  return (
    <Calendar
      selectedRange={selectedRange}
      disabledRanges={DISABLED_RANGES}
      onUpdateRange={setSelectedRange}
    />
  );
};

export const Standard = {
  render: () => {
    return <Wrapper />;
  },
};
