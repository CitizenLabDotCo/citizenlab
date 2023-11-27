import { useMemo, useState } from 'react';

// hooks
import { useNode } from '@craftjs/core';
import useLiveReactionsByTime from 'components/admin/GraphCards/ReactionsByTimeCard/useReactionsByTime/useLiveReactionsByTime';
import useGraphDataUnitsPublished from 'api/graph_data_units/useGraphDataUnitsPublished';

// routing
import { useLocation } from 'react-router-dom';

// i18n
import { useIntl } from 'utils/cl-intl';
import { getTranslations } from 'components/admin/GraphCards/ReactionsByTimeCard/useReactionsByTime/translations';

// parse
import {
  parseTimeSeries,
  parseExcelData,
} from 'components/admin/GraphCards/ReactionsByTimeCard/useReactionsByTime/parse';

// utils
import { getFormattedNumbers } from 'components/admin/GraphCards/_utils/parse';
import { isPage } from 'utils/helperUtils';

// typings
import {
  QueryParameters,
  Response,
} from 'components/admin/GraphCards/ReactionsByTimeCard/useReactionsByTime/typings';

type Parameters = QueryParameters & {
  reportId?: string;
};

export default function useReactionsByTime({
  projectId,
  startAtMoment,
  endAtMoment,
  resolution,
  reportId,
}: Parameters) {
  const { formatMessage } = useIntl();
  const [currentResolution] = useState(resolution);

  const { pathname } = useLocation();
  const { id: graphId } = useNode();
  const isAdminPage = isPage('admin', pathname);

  const { data: analyticsLive } = useLiveReactionsByTime(
    {
      projectId,
      startAtMoment,
      endAtMoment,
      resolution,
    },
    { enabled: isAdminPage }
  );

  const { data: analyticsPublished } = useGraphDataUnitsPublished<Response>(
    {
      reportId,
      graphId,
    },
    { enabled: !isAdminPage }
  );

  const analytics = analyticsLive ?? analyticsPublished;

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
