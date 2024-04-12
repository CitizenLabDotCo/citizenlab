import { useMemo, useState } from 'react';

import useAnalytics from 'api/analytics/useAnalytics';

import { getFormattedNumbers } from 'components/admin/GraphCards/_utils/parse';

import { useIntl } from 'utils/cl-intl';

import { parseTimeSeries, parseExcelData } from './parse';
import { query } from './query';
import { getTranslations } from './translations';
import { QueryParameters, Response } from './typings';

export default function useRegistrationsByTime({
  startAtMoment,
  endAtMoment,
  resolution,
}: QueryParameters) {
  const { formatMessage } = useIntl();
  const [currentResolution, setCurrentResolution] = useState(resolution);
  const { data: analytics } = useAnalytics<Response>(
    query({
      startAtMoment,
      endAtMoment,
      resolution,
    }),
    () => setCurrentResolution(resolution)
  );

  const timeSeries = useMemo(
    () =>
      analytics?.data
        ? parseTimeSeries(
            analytics.data.attributes[0],
            startAtMoment,
            endAtMoment,
            currentResolution,
            analytics.data.attributes[1]
          )
        : null,
    [analytics?.data, startAtMoment, endAtMoment, currentResolution]
  );

  const xlsxData = useMemo(
    () =>
      analytics?.data && timeSeries
        ? parseExcelData(timeSeries, getTranslations(formatMessage))
        : null,
    [analytics?.data, timeSeries, formatMessage]
  );

  const firstSerieBar =
    timeSeries && timeSeries.length > 0 ? timeSeries[0].registrations : 0;

  const formattedNumbers = timeSeries
    ? getFormattedNumbers(timeSeries, firstSerieBar)
    : {
        totalNumber: null,
        formattedSerieChange: null,
        typeOfChange: '',
      };

  return { currentResolution, timeSeries, xlsxData, formattedNumbers };
}
