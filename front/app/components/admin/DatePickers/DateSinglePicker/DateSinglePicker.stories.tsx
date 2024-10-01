import React, { useState } from 'react';

import DateSinglePicker from './index2';

import type { Meta } from '@storybook/react';

const meta = {
  title: 'DateSinglePicker',
  component: DateSinglePicker,
  parameters: {
    chromatic: { disableSnapshot: false },
  },
} satisfies Meta<typeof DateSinglePicker>;

export default meta;

const WrapperStandard = () => {
  const [selectedDate, setSelectedDate] = useState<Date>();

  return (
    <DateSinglePicker
      selectedDate={selectedDate}
      onChange={(date) => {
        setSelectedDate(date);
      }}
    />
  );
};

export const Standard = {
  render: () => {
    return <WrapperStandard />;
  },
};
