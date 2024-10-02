import React, { useState } from 'react';

import { Box } from '@citizenlab/cl2-component-library';

import DateSinglePicker from './index2';

import OldDateSinglePicker from '.';

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
    <DateSinglePicker selectedDate={selectedDate} onChange={setSelectedDate} />
  );
};

export const Standard = {
  render: () => {
    return <WrapperStandard />;
  },
};

// TODO remove
const WrapperOld = () => {
  const [selectedDate, setSelectedDate] = useState<Date>();

  return (
    <Box w="120px">
      <OldDateSinglePicker
        selectedDate={selectedDate ?? null}
        onChange={(date) => {
          setSelectedDate(date ?? undefined);
        }}
      />
    </Box>
  );
};

export const Old = {
  render: () => {
    return <WrapperOld />;
  },
};
