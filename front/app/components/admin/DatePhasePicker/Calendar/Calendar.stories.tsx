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
  { from: new Date(2024, 7, 1), to: new Date(2024, 8, 5) },
  { from: new Date(2024, 8, 21), to: new Date(2024, 9, 28) },
  // { from: new Date('2024-09-21') },
];

const Wrapper = () => {
  const [selectedRange, setSelectedRange] = useState<DateRange>({
    from: new Date(2024, 8, 10),
    to: new Date(2024, 8, 20),
    // from: new Date('2024-11-10'),
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
