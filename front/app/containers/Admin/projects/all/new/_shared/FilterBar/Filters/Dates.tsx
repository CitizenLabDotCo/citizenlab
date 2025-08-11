import React from 'react';

import { trackEventByName } from 'utils/analytics';

import { useParam, setParam } from '../../params';

import DateRangeFilter from './DateRangeFilter';
import tracks from './tracks';

const Dates = () => {
  const fromStr = useParam('min_start_date');
  const toStr = useParam('max_start_date');

  const handleDateRangeChange = (from?: string, to?: string) => {
    setParam('min_start_date', from);
    setParam('max_start_date', to);
    trackEventByName(tracks.setDates, { from, to });
  };

  return (
    <DateRangeFilter
      minStartDate={fromStr}
      maxStartDate={toStr}
      onDateRangeChange={handleDateRangeChange}
    />
  );
};

export default Dates;
