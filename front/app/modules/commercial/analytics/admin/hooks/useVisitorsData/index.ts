import { useState, useEffect } from 'react';
import moment from 'moment';

// services
import {
  analyticsStream,
  Query,
  QuerySchema,
  AggregationsConfig,
} from '../../services/analyticsFacts';

// parse
import { parseStats, parseTimeSeries } from './parse';

// utils
import {
  getProjectFilter,
  getDateFilter,
  getInterval,
} from '../../utils/query';

// typings
import { isNilOrError, NilOrError } from 'utils/helperUtils';
import { XlsxData } from 'components/admin/ReportExportMenu';
import { QueryParameters, Response, Stats, TimeSeries } from './typings';
import { IResolution } from 'components/admin/ResolutionControl';

const getAggregations = (): AggregationsConfig => ({
  all: 'count',
  visitor_id: 'count',
  duration: 'avg',
  pages_visited: 'avg',
});

const getLastPeriod = (resolution: IResolution) => {
  if (resolution === 'month') {
    return moment().subtract({ days: 30 }).format('YYYY-MM-DD');
  }

  if (resolution === 'week') {
    return moment().subtract({ days: 7 }).format('YYYY-MM-DD');
  }

  return moment().subtract({ days: 1 }).format('YYYY-MM-DD');
};

const query = ({
  projectId,
  startAtMoment,
  endAtMoment,
  resolution,
}: QueryParameters): Query => {
  const startAt = startAtMoment?.toISOString();
  const endAt = endAtMoment?.toISOString();

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
  const lastPeriod = getLastPeriod(resolution);

  const totalsLastPeriodQuery: QuerySchema = {
    fact: 'visit',
    filters: {
      dimension_user: {
        role: ['citizen', null],
      },
      ...getProjectFilter(projectId),
      dimension_date_last_action: {
        date: {
          from: lastPeriod,
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
    aggregations: {
      all: 'count',
      visitor_id: 'count',
    },
  };

  return {
    query: [totalsWholePeriodQuery, totalsLastPeriodQuery, timeSeriesQuery],
  };
};

export default function useVisitorsData({
  projectId,
  startAtMoment,
  endAtMoment,
  resolution,
}: QueryParameters) {
  const [stats, setStats] = useState<Stats | NilOrError>();
  const [timeSeries, setTimeSeries] = useState<TimeSeries | NilOrError>();
  const [xlsxData, setXlsxData] = useState<XlsxData | NilOrError>();

  useEffect(() => {
    const observable = analyticsStream<Response>(
      query({
        projectId,
        startAtMoment,
        endAtMoment,
        resolution,
      })
    ).observable;

    const subscription = observable.subscribe(
      (response: Response | NilOrError) => {
        if (isNilOrError(response)) {
          setStats(response);
          setTimeSeries(response);
          setXlsxData(response);
          return;
        }

        setStats(parseStats(response.data));

        setTimeSeries(parseTimeSeries(
          response.data[2],
          startAtMoment,
          endAtMoment,
          resolution
        ));
      }
    );

    return () => subscription.unsubscribe();
  }, [projectId, startAtMoment, endAtMoment, resolution]);

  return { stats, timeSeries, xlsxData };
}
