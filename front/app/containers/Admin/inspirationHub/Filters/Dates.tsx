import React from 'react';

import { format } from 'date-fns';

import DateRangePicker from 'components/admin/DatePickers/DateRangePicker';

import { useRansackParam, setRansackParam } from '../utils';

const toDate = (str?: string) => {
  if (!str) return;
  return new Date(str);
};

const toString = (date?: Date) => {
  if (!date) return;
  return format(date, 'yyyy-MM-dd');
};

const Dates = () => {
  const fromStr = useRansackParam('q[practical_end_at_gteq]');
  const toStr = useRansackParam('q[practical_end_at_lt]');

  return (
    <DateRangePicker
      selectedRange={{ from: toDate(fromStr), to: toDate(toStr) }}
      onUpdateRange={({ from, to }) => {
        setRansackParam('q[practical_end_at_gteq]', toString(from));
        setRansackParam('q[practical_end_at_lt]', toString(to));
      }}
    />
  );
};

export default Dates;
