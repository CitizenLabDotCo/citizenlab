import React, { useState } from 'react';

import { getMonth, addDays } from 'date-fns';

import { DateRange } from '../_shared/typings';

import DateRangePicker from '.';

import type { Meta } from '@storybook/react';

const meta = {
  title: 'DateRangePicker',
  component: DateRangePicker,
} satisfies Meta<typeof DateRangePicker>;

export default meta;

const WrapperStandard = () => {
  const [selectedRange, setSelectedRange] = useState<Partial<DateRange>>({});

  return (
    <DateRangePicker
      selectedRange={selectedRange}
      onUpdateRange={setSelectedRange}
    />
  );
};

export const Standard = {
  render: () => {
    return <WrapperStandard />;
  },
};

const WrapperDisabled = () => {
  const [selectedRange, setSelectedRange] = useState<Partial<DateRange>>({});
  const month = new Date(getMonth(new Date()));

  return (
    <DateRangePicker
      selectedRange={selectedRange}
      startMonth={month}
      disabled={{ from: month, to: addDays(new Date(), -1) }}
      onUpdateRange={setSelectedRange}
    />
  );
};

export const Disabled = {
  render: () => {
    return <WrapperDisabled />;
  },
};
