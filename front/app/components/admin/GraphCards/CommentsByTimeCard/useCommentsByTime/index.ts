import { useMemo, useState } from 'react';

import { useParticipationLive } from 'api/graph_data_units';

import { getFormattedNumbers } from 'components/admin/GraphCards/_utils/parse';

import { useIntl } from 'utils/cl-intl';
import { momentToIsoDate } from 'utils/dateUtils';

import { parseTimeSeries, parseExcelData } from './parse';
import { getTranslations } from './translations';
import { QueryParameters } from './typings';

export default function useCommentsByTime({
  projectId,
  startAtMoment,
  endAtMoment,
  resolution,
}: QueryParameters) {
  const [currentResolution, setCurrentResolution] = useState(resolution);
  const { data: analytics } = useParticipationLive(
    {
      project_id: projectId,
      start_at: momentToIsoDate(startAtMoment),
      end_at: momentToIsoDate(endAtMoment),
      resolution,
    },
    {
      onSuccess: () => setCurrentResolution(resolution),
    }
  );

  const { formatMessage } = useIntl();

  const timeSeries = useMemo(
    () =>
      analytics?.data
        ? parseTimeSeries(
            analytics.data.attributes[1],
            startAtMoment,
            endAtMoment,
            currentResolution
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
