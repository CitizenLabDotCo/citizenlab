// i18n
import { useIntl } from 'utils/cl-intl';
import { getTranslations } from './translations';

// query
import { query } from './query';

// parse
import { parseTimeSeries, parseExcelData } from './parse';

// utils
import { getFormattedNumbers } from 'components/admin/GraphCards/_utils/parse';

// typings
import { QueryParameters, Response } from './typings';
import useAnalytics from 'api/analytics/useAnalytics';
import { useMemo } from 'react';

export default function useCommentsByTime({
  projectId,
  startAtMoment,
  endAtMoment,
  resolution,
}: QueryParameters) {
  const { data: analytics } = useAnalytics<Response>(
    query({
      projectId,
      startAtMoment,
      endAtMoment,
      resolution,
    })
  );

  const { formatMessage } = useIntl();

  const timeSeries = useMemo(
    () =>
      analytics?.data
        ? parseTimeSeries(
            analytics.data.attributes[0],
            startAtMoment,
            endAtMoment,
            resolution,
            analytics.data.attributes[1]
          )
        : null,
    [analytics?.data, startAtMoment, endAtMoment, resolution]
  );

  const xlsxData = useMemo(
    () =>
      analytics?.data && timeSeries
        ? parseExcelData(timeSeries, getTranslations(formatMessage))
        : null,
    [analytics?.data, timeSeries, formatMessage]
  );

  const formattedNumbers = timeSeries
    ? getFormattedNumbers(timeSeries, timeSeries[0].comments)
    : {
        totalNumber: null,
        formattedSerieChange: null,
        typeOfChange: '',
      };

  const currentResolution = resolution;

  return { currentResolution, timeSeries, xlsxData, formattedNumbers };
}
