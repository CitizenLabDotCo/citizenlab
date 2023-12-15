// i18n
import { useIntl } from 'utils/cl-intl';
import { getTranslations } from './translations';

// parse
import { parseTimeSeries, parseExcelData } from './parse';

// utils
import { getFormattedNumbers } from 'components/admin/GraphCards/_utils/parse';

// typings
import { QueryParameters } from './typings';
import { useMemo, useState } from 'react';

// hooks
import useLiveCommentsByTime from './useLiveCommentsByTime';

export default function useCommentsByTime({
  projectId,
  startAtMoment,
  endAtMoment,
  resolution,
}: QueryParameters) {
  const [currentResolution, setCurrentResolution] = useState(resolution);
  const { data: analytics } = useLiveCommentsByTime(
    {
      projectId,
      startAtMoment,
      endAtMoment,
      resolution,
    },
    {
      onSuccess: () => {
        setCurrentResolution(resolution);
      },
    }
  );

  const { formatMessage } = useIntl();

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

  const formattedNumbers = timeSeries
    ? getFormattedNumbers(timeSeries, timeSeries[0].comments)
    : {
        totalNumber: null,
        formattedSerieChange: null,
        typeOfChange: '',
      };

  return { currentResolution, timeSeries, xlsxData, formattedNumbers };
}
