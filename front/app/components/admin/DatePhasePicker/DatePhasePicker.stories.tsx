import React, { useState } from 'react';

import { DateRange } from './typings';

import DatePhasePicker from '.';

import type { Meta } from '@storybook/react';

const meta = {
  title: 'DatePhasePicker',
  component: DatePhasePicker,
  parameters: {
    chromatic: { disableSnapshot: false },
  },
} satisfies Meta<typeof DatePhasePicker>;

export default meta;
// type Story = StoryObj<typeof meta>;

// const DISABLED_RANGES = [
//   { from: new Date(2024, 7, 1), to: new Date(2024, 8, 5) },
//   { from: new Date(2024, 8, 21), to: new Date(2024, 9, 20) },
// ];

const Wrapper = () => {
  const [selectedRange, setSelectedRange] = useState<Partial<DateRange>>({});

  return (
    <DatePhasePicker
      selectedRange={selectedRange}
      onUpdateRange={setSelectedRange}
    />
  );
};

export const Standard = {
  render: () => {
    return <Wrapper />;
  },
};
