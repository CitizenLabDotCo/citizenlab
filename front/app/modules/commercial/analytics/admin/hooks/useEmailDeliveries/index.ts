import { useState, useEffect } from 'react';

// services
import {
  analyticsStream,
  Query,
  QuerySchema,
} from '../../services/analyticsFacts';

// i18n
import { useIntl } from 'utils/cl-intl';
import { getTranslations } from './translations';

// parse
import {
  parseStats,
  parseTimeSeries,
  mergeTimeSeries,
  parseExcelData,
} from './parse';

// utils
import { getDateFilter, getInterval } from '../../utils/query';
import { deduceResolution } from './utils';

// typings
import { isNilOrError, NilOrError } from 'utils/helperUtils';
import { XlsxData } from 'components/admin/ReportExportMenu';
import {
  QueryParameters,
  Response,
  Stats,
  TimeSeries,
  PreparedTimeSeriesResponse,
} from './typings';
import { IResolution } from 'components/admin/ResolutionControl';

const query = ({
  startAtMoment,
  endAtMoment,
  resolution,
}: QueryParameters): Query => {
  const dateFilter = getDateFilter(
    'dimension_date_sent',
    startAtMoment,
    endAtMoment
  );

  const totalEmailsDeliveriesQuery: QuerySchema = {
    fact: 'email_delivery',
    filters: dateFilter,
    aggregations: {
      all: 'count',
    },
  };

  const customEmailsDeliveriesQuery: QuerySchema = {
    fact: 'email_delivery',
    filters: {
      ...dateFilter,
      automated: false,
    },
    aggregations: {
      all: 'count',
      campaign_id: 'count',
    },
  };

  const automatedEmailsDeliveriesQuery: QuerySchema = {
    fact: 'email_delivery',
    filters: {
      ...dateFilter,
      automated: true,
    },
    aggregations: {
      all: 'count',
      campaign_id: 'count',
    },
  };

  const timeSeriesQuery: QuerySchema = {
    fact: 'email_delivery',
    filters: { dateFilter },
    groups: [`dimension_date_sent.${getInterval(resolution)}`, 'automated'],
    aggregations: {
      all: 'count',
      'dimension_date_sent.date': 'first',
    },
  };

  return {
    query: [
      totalEmailsDeliveriesQuery,
      customEmailsDeliveriesQuery,
      automatedEmailsDeliveriesQuery,
      timeSeriesQuery,
    ],
  };
};

export default function useVisitorsData({
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
        const preparedTimeSeries = mergeTimeSeries(
          response.data[3],
          `dimension_date_sent.${getInterval(resolution)}`
        );
        const translations = getTranslations(formatMessage);

        const deducedResolution =
          deduceResolution(preparedTimeSeries as PreparedTimeSeriesResponse) ??
          resolution;
        setDeducedResolution(deducedResolution);

        const stats = parseStats(response.data);
        setStats(stats);

        const timeSeries = parseTimeSeries(
          preparedTimeSeries as PreparedTimeSeriesResponse,
          startAtMoment,
          endAtMoment,
          deducedResolution
        );
        setTimeSeries(timeSeries);

        setXlsxData(parseExcelData(stats, timeSeries, translations));
      }
    );

    return () => subscription.unsubscribe();
  }, [startAtMoment, endAtMoment, resolution, formatMessage]);

  return { deducedResolution, stats, timeSeries, xlsxData };
}
