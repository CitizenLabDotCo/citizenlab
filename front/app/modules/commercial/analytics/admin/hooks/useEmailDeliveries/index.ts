import { useState, useEffect } from 'react';

// services
import { analyticsStream } from '../../services/analyticsFacts';

// i18n
import { useIntl } from 'utils/cl-intl';
import { getTranslations } from './translations';

// query
import { query } from './query';

// parse
import {
  parseStats,
  parseTimeSeries,
  mergeTimeSeries,
  parseExcelData,
} from './parse';

// utils
import { getInterval } from '../../utils/query';

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

export default function useVisitorsData({
  startAtMoment,
  endAtMoment,
  resolution,
}: QueryParameters) {
  const { formatMessage } = useIntl();

  const [currentResolution, setCurrentResolution] =
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
          setCurrentResolution(resolution);
          return;
        }
        const preparedTimeSeries = mergeTimeSeries(
          response.data[3],
          `dimension_date_sent.${getInterval(resolution)}`
        );
        const translations = getTranslations(formatMessage);

        setCurrentResolution(resolution);

        const stats = parseStats(response.data);
        setStats(stats);

        const timeSeries = parseTimeSeries(
          preparedTimeSeries as PreparedTimeSeriesResponse,
          startAtMoment,
          endAtMoment,
          currentResolution
        );
        setTimeSeries(timeSeries);

        setXlsxData(parseExcelData(stats, timeSeries, translations));
      }
    );

    return () => subscription.unsubscribe();
  }, [startAtMoment, endAtMoment, resolution, formatMessage]);

  return { currentResolution, stats, timeSeries, xlsxData };
}
