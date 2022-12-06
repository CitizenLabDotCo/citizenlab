import { useState, useEffect } from 'react';
// services
import { analyticsStream } from '../../services/analyticsFacts';
// i18n
import { useIntl } from 'utils/cl-intl';
// utils
import { isNilOrError, NilOrError } from 'utils/helperUtils';
import { XlsxData } from 'components/admin/ReportExportMenu';
import { IResolution } from 'components/admin/ResolutionControl';
// parse
import { parseTimeSeries, parseStats, parseExcelData } from './parse';
// query
import { query } from './query';
import { getTranslations } from './translations';
// typings
import { QueryParameters, Response, TimeSeries, Stats } from './typings';

export default function useActiveUsers({
  projectId,
  startAtMoment,
  endAtMoment,
  resolution,
}: QueryParameters) {
  const { formatMessage } = useIntl();

  const [timeSeries, setTimeSeries] = useState<TimeSeries | NilOrError>();
  const [stats, setStats] = useState<Stats | NilOrError>();
  const [xlsxData, setXlsxData] = useState<XlsxData | NilOrError>();

  const [currentResolution, setCurrentResolution] =
    useState<IResolution>(resolution);

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

        const translations = getTranslations(formatMessage);

        setCurrentResolution(resolution);

        const stats = parseStats(response.data);
        setStats(stats);

        const timeSeries = parseTimeSeries(
          response.data[0],
          startAtMoment,
          endAtMoment,
          resolution
        );

        setTimeSeries(timeSeries);

        setXlsxData(
          parseExcelData(stats, timeSeries, resolution, translations)
        );
      }
    );

    return () => subscription.unsubscribe();
  }, [projectId, startAtMoment, endAtMoment, resolution, formatMessage]);

  return { timeSeries, stats, xlsxData, currentResolution };
}
