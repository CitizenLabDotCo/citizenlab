// services

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

export default function useReactionsByTime({
  projectId,
  startAtMoment,
  endAtMoment,
  resolution,
}: QueryParameters) {
  const { formatMessage } = useIntl();
  const { data: analytics } = useAnalytics<Response>(
    query({
      projectId,
      startAtMoment,
      endAtMoment,
      resolution,
    })
  );

  const timeSeries = analytics?.data
    ? parseTimeSeries(
        analytics.data.attributes[0],
        startAtMoment,
        endAtMoment,
        resolution,
        analytics.data.attributes[1]
      )
    : null;

  const xlsxData =
    analytics?.data && timeSeries
      ? parseExcelData(timeSeries, getTranslations(formatMessage))
      : null;

  const firstSerieBar =
    timeSeries && timeSeries.length > 0
      ? timeSeries[0].likes + timeSeries[0].dislikes
      : 0;

  const formattedNumbers = timeSeries
    ? getFormattedNumbers(timeSeries, firstSerieBar)
    : {
        totalNumber: null,
        formattedSerieChange: null,
        typeOfChange: '',
      };

  const currentResolution = resolution;

  return { currentResolution, timeSeries, xlsxData, formattedNumbers };
}
