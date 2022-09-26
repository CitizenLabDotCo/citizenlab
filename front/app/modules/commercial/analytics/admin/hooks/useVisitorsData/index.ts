import { useState, useEffect } from 'react';
import moment from 'moment';
import { fakeStats, fakeTimeSeries, fakeXlsxData } from './fakeData';

// services
import {
  analyticsStream,
  Query,
  QuerySchema,
  AggregationsConfig,
} from '../../services/analyticsFacts';

// utils
import {
  getProjectFilter,
  getDateFilter,
  getInterval,
} from '../../utils/query';

// typings
import { NilOrError } from 'utils/helperUtils';
import { XlsxData } from 'components/admin/ReportExportMenu';
import { IResolution } from 'components/admin/ResolutionControl';

interface QueryParameters {
  projectId: string | undefined;
  startAt: string | null | undefined;
  endAt: string | null | undefined;
  resolution: IResolution;
}

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

const getAggregations = (): AggregationsConfig => ({
  all: 'count',
  visitor_id: 'count',
  duration: 'avg',
  pages_visited: 'avg',
});

const query = ({
  projectId,
  startAt,
  endAt,
  resolution,
}: QueryParameters): Query => {
  const totalsWholePeriodQuery: QuerySchema = {
    fact: 'visit',
    filters: {
      dimension_user: {
        role: ['citizen', null],
      },
      ...getProjectFilter(projectId),
      ...getDateFilter('dimension_date_last_action', startAt, endAt),
    },
    aggregations: getAggregations(),
  };

  const today = moment().format('YYYY-MM-DD');
  const thirtyDaysAgo = moment().subtract({ days: 30 }).format('YYYY-MM-DD');

  const totalsLast30DaysQuery: QuerySchema = {
    fact: 'visit',
    filters: {
      dimension_user: {
        role: ['citizen', null],
      },
      ...getProjectFilter(projectId),
      dimension_date_last_action: {
        date: {
          from: thirtyDaysAgo,
          to: today,
        },
      },
    },
    aggregations: getAggregations(),
  };

  const timeSeriesQuery: QuerySchema = {
    fact: 'visit',
    filters: {
      dimension_user: {
        role: ['citizen', null],
      },
      ...getProjectFilter(projectId),
      ...getDateFilter('dimension_date_last_action', startAt, endAt),
    },
    groups: `dimension_date_last_action.${getInterval(resolution)}`,
    aggregations: getAggregations(),
  };

  return {
    query: [totalsWholePeriodQuery, totalsLast30DaysQuery, timeSeriesQuery],
  };
};

export default function useVisitorsData({
  projectId,
  startAt,
  endAt,
  resolution,
}: QueryParameters) {
  const [stats, setStats] = useState<Stats | NilOrError>();
  const [timeSeries, setTimeSeries] = useState<TimeSeries | NilOrError>();
  const [xlsxData, setXlsxData] = useState<XlsxData | NilOrError>();

  useEffect(() => {
    const observable = analyticsStream(
      query({
        projectId,
        startAt,
        endAt,
        resolution,
      })
    ).observable;

    const subscription = observable.subscribe(() => {
      // TODO
      setStats(fakeStats);
      setTimeSeries(fakeTimeSeries);
      setXlsxData(fakeXlsxData);
    });

    return () => subscription.unsubscribe();
  }, [projectId, startAt, endAt, resolution]);

  return { stats, timeSeries, xlsxData };
}
