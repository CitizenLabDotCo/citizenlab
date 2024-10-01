import React, { useState } from 'react';

import DateSinglePicker from '.';

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
      selectedDate={selectedDate ?? null}
      onChange={(date) => {
        setSelectedDate(date ?? undefined);
      }}
    />
  );
};

export const Standard = {
  render: () => {
    return <WrapperStandard />;
  },
};
