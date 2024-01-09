import { useMemo, useState } from 'react';

// hooks
import useGraphDataUnitsLive from 'api/graph_data_units/useGraphDataUnitsLive';

// i18n
import { useIntl } from 'utils/cl-intl';
import { getTranslations } from './translations';

// parse
import { parseTimeSeries, parseExcelData } from './parse';

// utils
import { getFormattedNumbers } from 'components/admin/GraphCards/_utils/parse';

// typings
import { Response, QueryParameters } from './typings';

export default function useReactionsByTime({
  projectId,
  startAtMoment,
  endAtMoment,
  resolution,
}: QueryParameters) {
  const { formatMessage } = useIntl();
  const [currentResolution, setCurrentResolution] = useState(resolution);

  const { data: analytics } = useGraphDataUnitsLive<Response>(
    {
      resolvedName: 'ReactionsByTimeWidget',
      props: {
        projectId,
        startAtMoment,
        endAtMoment,
        resolution,
      },
    },
    {
      onSuccess: () => {
        setCurrentResolution(resolution);
      },
    }
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

  return { currentResolution, timeSeries, xlsxData, formattedNumbers };
}
