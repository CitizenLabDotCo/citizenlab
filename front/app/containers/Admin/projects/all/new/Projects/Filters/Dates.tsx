import React from 'react';

import { format } from 'date-fns';

import DateRangePicker from 'components/admin/DatePickers/DateRangePicker';

import { parseBackendDateString } from 'utils/dateUtils';

import { useParam, setParam } from '../utils';

const toDate = (str?: string) => {
  if (!str) return;
  return parseBackendDateString(str);
};

const toString = (date?: Date) => {
  if (!date) return;
  return format(date, 'yyyy-MM-dd');
};

const Dates = () => {
  const fromStr = useParam('min_start_date');
  const toStr = useParam('max_start_date');

  return (
    <DateRangePicker
      selectedRange={{ from: toDate(fromStr), to: toDate(toStr) }}
      onUpdateRange={({ from: fromDate, to: toDate }) => {
        const from = toString(fromDate);
        const to = toString(toDate);

        setParam('min_start_date', from);
        setParam('max_start_date', to);
      }}
    />
  );
};

export default Dates;
