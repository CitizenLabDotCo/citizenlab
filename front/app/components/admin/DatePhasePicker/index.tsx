import React from 'react';

import Input from './Input';
import { DateRange } from './typings';

interface Props {
  selectedRange: Partial<DateRange>;
}

const DateRangePicker = ({ selectedRange }: Props) => {
  return <Input selectedRange={selectedRange} />;
};

export default DateRangePicker;
