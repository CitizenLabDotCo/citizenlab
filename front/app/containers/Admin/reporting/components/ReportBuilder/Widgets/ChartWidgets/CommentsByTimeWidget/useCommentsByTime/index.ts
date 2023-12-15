// i18n
import { useIntl } from 'utils/cl-intl';
import { getTranslations } from 'components/admin/GraphCards/CommentsByTimeCard/useCommentsByTime/translations';

// hooks
import useLiveCommentsByTime from 'components/admin/GraphCards/CommentsByTimeCard/useCommentsByTime/useLiveCommentsByTime';
import { useLocation } from 'react-router-dom';
import { useNode } from '@craftjs/core';
import useGraphDataUnitsPublished from 'api/graph_data_units/useGraphDataUnitsPublished';
import { useReportContext } from 'containers/Admin/reporting/context/ReportContext';

// parse
import {
  parseTimeSeries,
  parseExcelData,
} from 'components/admin/GraphCards/CommentsByTimeCard/useCommentsByTime/parse';

// utils
import { getFormattedNumbers } from 'components/admin/GraphCards/_utils/parse';
import { isPage } from 'utils/helperUtils';

// typings
import {
  QueryParameters,
  Response,
} from 'components/admin/GraphCards/CommentsByTimeCard/useCommentsByTime/typings';
import { useMemo, useState } from 'react';

export default function useCommentsByTime({
  projectId,
  startAtMoment,
  endAtMoment,
  resolution,
}: QueryParameters) {
  const { formatMessage } = useIntl();
  const [currentResolution] = useState(resolution);

  const { pathname } = useLocation();
  const { id: graphId } = useNode();
  const isAdminPage = isPage('admin', pathname);
  const { reportId } = useReportContext();

  const { data: analyticsLive } = useLiveCommentsByTime(
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

  const formattedNumbers = timeSeries
    ? getFormattedNumbers(timeSeries, timeSeries[0].comments)
    : {
        totalNumber: null,
        formattedSerieChange: null,
        typeOfChange: '',
      };

  return { currentResolution, timeSeries, xlsxData, formattedNumbers };
}
