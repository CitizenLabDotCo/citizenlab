import React from 'react';

import { DateRange } from '../_shared/typings';

interface Props {
  selectedRange: Partial<DateRange>;
  startMonth?: Date;
  endMonth?: Date;
  onUpdateRange: (range: DateRange) => void;
}

const DateRangePicker = (_props: Props) => {
  return <></>;
};

export default DateRangePicker;
