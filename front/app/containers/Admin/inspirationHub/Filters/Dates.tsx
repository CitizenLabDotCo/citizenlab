import React from 'react';

import { format } from 'date-fns';

import DateRangePicker from 'components/admin/DatePickers/DateRangePicker';

import { trackEventByName } from 'utils/analytics';
import { parseBackendDateString } from 'utils/dateUtils';

import { useRansackParam, setRansackParam } from '../utils';

import tracks from './tracks';

const toDate = (str?: string) => {
  if (!str) return;
  return parseBackendDateString(str);
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
      onUpdateRange={({ from: fromDate, to: toDate }) => {
        const from = toString(fromDate);
        const to = toString(toDate);

        setRansackParam('q[practical_end_at_gteq]', from);
        setRansackParam('q[practical_end_at_lt]', to);
        trackEventByName(tracks.setDates, { from, to });
      }}
    />
  );
};

export default Dates;
