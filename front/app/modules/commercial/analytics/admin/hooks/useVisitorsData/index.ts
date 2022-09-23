import { useState, useEffect } from 'react';
import { fakeStats, fakeTimeSeries } from './fakeData';

// typings
import { NilOrError } from 'utils/helperUtils';

interface Stat {
  value: number;
  lastPeriod: number;
}

interface Stats {
  visitors: Stat;
  visits: Stat;
  visitDuration: Stat;
  pageViews: Stat;
}

export interface TimeSeriesRow {
  /* Date format: YYYY-MM-DD */
  date: string;
  visits: number;
  visitors: number;
}

export type TimeSeries = TimeSeriesRow[];

export default function useVisitorsData() {
  const [stats, setStats] = useState<Stats | NilOrError>();
  const [timeSeries, setTimeSeries] = useState<TimeSeries | NilOrError>();

  useEffect(() => {
    setStats(fakeStats);
    setTimeSeries(fakeTimeSeries);
  }, []);

  return { stats, timeSeries };
}
