import { useState, useEffect } from 'react';
import { fakeStats, fakeTimeSeries, fakeXlsxData } from './fakeData';

// typings
import { NilOrError } from 'utils/helperUtils';
import { XlsxData } from 'components/admin/ReportExportMenu';

// interface QueryProps {
//   projectId: string | undefined;
//   startAt: string | null | undefined;
//   endAt: string | null | undefined;
// }

// Response
// TODO

// Hook return value
interface Stat {
  value: string;
  lastPeriod: string;
}

export interface Stats {
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
  const [xlsxData, setXlsxData] = useState<XlsxData | NilOrError>();

  useEffect(() => {
    setStats(fakeStats);
    setTimeSeries(fakeTimeSeries);
    setXlsxData(fakeXlsxData);
  }, []);

  return { stats, timeSeries, xlsxData };
}
