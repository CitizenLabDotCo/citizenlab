import React from 'react';

import { format } from 'date-fns';

import DateRangePicker from 'components/admin/DatePickers/DateRangePicker';

import { useParam, setParam } from '../utils';

const toDate = (str?: string) => {
  if (!str) return;
  return new Date(str);
};

const toString = (date?: Date) => {
  if (!date) return;
  return format(date, 'yyyy-MM-dd');
};

const Dates = () => {
  const fromStr = useParam('start_at');
  const toStr = useParam('end_at');

  return (
    <DateRangePicker
      selectedRange={{ from: toDate(fromStr), to: toDate(toStr) }}
      onUpdateRange={({ from: fromDate, to: toDate }) => {
        const from = toString(fromDate);
        const to = toString(toDate);

        setParam('start_at', from);
        setParam('end_at', to);
      }}
    />
  );
};

export default Dates;
