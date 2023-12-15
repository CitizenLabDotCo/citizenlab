import { useMemo, useState } from 'react';

// hooks
import useGraphDataUnits from 'api/graph_data_units/useGraphDataUnits';

// i18n
import { useIntl } from 'utils/cl-intl';
import { getTranslations } from 'components/admin/GraphCards/PostsByTimeCard/usePostsByTime/translations';

// parse
import {
  parseTimeSeries,
  parseExcelData,
} from 'components/admin/GraphCards/PostsByTimeCard/usePostsByTime/parse';

// utils
import { getFormattedNumbers } from 'components/admin/GraphCards/_utils/parse';

// typings
import {
  QueryParameters,
  Response,
} from 'components/admin/GraphCards/PostsByTimeCard/usePostsByTime/typings';

export default function usePostsByTime({
  projectId,
  startAtMoment,
  endAtMoment,
  resolution,
}: QueryParameters) {
  const { formatMessage } = useIntl();
  const [currentResolution] = useState(resolution);

  const analytics = useGraphDataUnits<Response>({
    resolvedName: 'PostsByTimeWidget',
    queryParameters: {
      projectId,
      startAtMoment,
      endAtMoment,
      resolution,
    },
  });

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
    ? getFormattedNumbers(timeSeries, timeSeries[0].inputs)
    : {
        totalNumber: null,
        formattedSerieChange: null,
        typeOfChange: '',
      };

  return { currentResolution, timeSeries, xlsxData, formattedNumbers };
}
