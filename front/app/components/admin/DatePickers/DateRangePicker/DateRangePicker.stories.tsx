import React, { useState } from 'react';

import { DateRange } from '../_shared/typings';

import DateRangePicker from './index2';

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
