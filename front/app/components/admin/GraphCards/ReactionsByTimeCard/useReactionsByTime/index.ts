import { useMemo, useState } from 'react';

// hooks
import { useNode } from '@craftjs/core';
import { useParams } from 'react-router-dom';
// import useLiveReactionsByTime from './useLiveReactionsByTime';
import useGraphDataUnitsPublished from 'api/graph_data_units/useGraphDataUnitsPublished';

// i18n
import { useIntl } from 'utils/cl-intl';
import { getTranslations } from './translations';

// parse
import { parseTimeSeries, parseExcelData } from './parse';

// utils
import { getFormattedNumbers } from 'components/admin/GraphCards/_utils/parse';

// typings
import { QueryParameters, Response } from './typings';

export default function useReactionsByTime({
  projectId: _projectId,
  startAtMoment,
  endAtMoment,
  resolution,
}: QueryParameters) {
  const { formatMessage } = useIntl();
  const [currentResolution, _setCurrentResolution] = useState(resolution);

  const { id: graphId } = useNode();
  const { reportId } = useParams<{ reportId: string }>();
  // const { data: analytics } = useAnalytics<Response>(
  //   query({
  //     projectId,
  //     startAtMoment,
  //     endAtMoment,
  //     resolution,
  //   }),
  //   () => setCurrentResolution(resolution)
  // );
  // const { data: analytics } = useLiveReactionsByTime({
  //   projectId,
  //   startAtMoment,
  //   endAtMoment,
  //   resolution,
  // });

  const { data: analytics } = useGraphDataUnitsPublished<Response>({
    reportId,
    graphId,
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
