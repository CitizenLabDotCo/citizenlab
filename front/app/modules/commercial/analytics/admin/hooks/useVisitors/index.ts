import { useState, useEffect } from 'react';

// services
import {
  analyticsStream,
  Query,
  QuerySchema,
  AggregationsConfig,
} from '../../services/analyticsFacts';

// i18n
import { useIntl } from 'utils/cl-intl';
import { getTranslations } from './translations';

// parse
import { parseStats, parseTimeSeries, parseExcelData } from './parse';

// utils
import {
  getProjectFilter,
  getDateFilter,
  getDateFilterLastPeriod,
  getInterval,
} from '../../utils/query';
import { deduceResolution } from './utils';

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

const query = ({
  projectId,
  startAtMoment,
  endAtMoment,
  resolution,
}: QueryParameters): Query => {
  const totalsWholePeriodQuery: QuerySchema = {
    fact: 'visit',
    filters: {
      'dimension_user.role': ['citizen', null],
      ...getProjectFilter('dimension_projects', projectId),
      ...getDateFilter(
        'dimension_date_last_action',
        startAtMoment,
        endAtMoment
      ),
    },
    aggregations: getAggregations(),
  };

  const totalsLastPeriodQuery: QuerySchema = {
    fact: 'visit',
    filters: {
      'dimension_user.role': ['citizen', null],
      ...getProjectFilter('dimension_projects', projectId),
      ...getDateFilterLastPeriod('dimension_date_last_action', resolution),
    },
    aggregations: getAggregations(),
  };

  const timeSeriesQuery: QuerySchema = {
    fact: 'visit',
    filters: {
      'dimension_user.role': ['citizen', null],
      ...getProjectFilter('dimension_projects', projectId),
      ...getDateFilter(
        'dimension_date_last_action',
        startAtMoment,
        endAtMoment
      ),
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
  const { formatMessage } = useIntl();

  const [deducedResolution, setDeducedResolution] =
    useState<IResolution>(resolution);
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
          setDeducedResolution(resolution);
          return;
        }

        const translations = getTranslations(formatMessage);

        const deducedResolution =
          deduceResolution(response.data[2]) ?? resolution;
        setDeducedResolution(deducedResolution);

        const stats = parseStats(response.data);
        setStats(stats);

        const timeSeries = parseTimeSeries(
          response.data[2],
          startAtMoment,
          endAtMoment,
          deducedResolution
        );
        setTimeSeries(timeSeries);

        setXlsxData(
          parseExcelData(stats, timeSeries, translations, deducedResolution)
        );
      }
    );

    return () => subscription.unsubscribe();
  }, [projectId, startAtMoment, endAtMoment, resolution, formatMessage]);

  return { deducedResolution, stats, timeSeries, xlsxData };
}
