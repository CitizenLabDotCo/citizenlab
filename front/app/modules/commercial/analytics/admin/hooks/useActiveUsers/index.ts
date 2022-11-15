import { useState, useEffect } from 'react';

// services
import { analyticsStream } from '../../services/analyticsFacts';

// i18n
import { useIntl } from 'utils/cl-intl';
import { getTranslations } from './translations';

// query
import { query } from './query';

// parse
import { parseTimeSeries, parseStats, parseExcelData } from './parse';

// utils
import { isNilOrError, NilOrError } from 'utils/helperUtils';
import { deduceResolution } from './utils';

// typings
import { QueryParameters, Response, TimeSeries, Stats } from './typings';
import { IResolution } from 'components/admin/ResolutionControl';
import { XlsxData } from 'components/admin/ReportExportMenu';

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

  const [deducedResolution, setDeducedResolution] =
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

        const deducedResolution =
          deduceResolution(response.data[0]) ?? resolution;
        setDeducedResolution(deducedResolution);

        const stats = parseStats(response.data);
        setStats(stats);

        const timeSeries = parseTimeSeries(
          response.data[0],
          startAtMoment,
          endAtMoment,
          deducedResolution
        );

        setTimeSeries(timeSeries);

        setXlsxData(
          parseExcelData(stats, timeSeries, deducedResolution, translations)
        );
      }
    );

    return () => subscription.unsubscribe();
  }, [projectId, startAtMoment, endAtMoment, resolution, formatMessage]);

  return { timeSeries, stats, xlsxData, deducedResolution };
}
