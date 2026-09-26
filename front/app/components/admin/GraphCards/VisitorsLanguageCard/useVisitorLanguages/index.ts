import { format } from 'date-fns';

import { useVisitorsLanguagesLive } from 'api/graph_data_units';

import { useIntl } from 'utils/cl-intl';

import { parsePieData, parseExcelData } from './parse';
import { getTranslations } from './translations';
import { QueryParameters } from './typings';

export default function useVisitorsData({
  projectId,
  startAtMoment,
  endAtMoment,
}: QueryParameters) {
  const { formatMessage } = useIntl();

  const { data: analytics } = useVisitorsLanguagesLive({
    project_id: projectId,
    start_at: startAtMoment ? format(startAtMoment, 'yyyy-MM-dd') : undefined,
    end_at: endAtMoment ? format(endAtMoment, 'yyyy-MM-dd') : undefined,
  });

  const translations = getTranslations(formatMessage);

  const pieData = analytics ? parsePieData(analytics.data.attributes) : null;

  const xlsxData =
    analytics && pieData
      ? parseExcelData(analytics.data.attributes, translations)
      : null;

  return { pieData, xlsxData };
}
