import { useIntl } from 'utils/cl-intl';

import { parsePieData, parseExcelData } from './parse';
import { getTranslations } from './translations';
import { QueryParameters } from './typings';

import { useVisitorsLanguagesLive } from 'api/graph_data_units';

export default function useVisitorsData({
  projectId,
  startAtMoment,
  endAtMoment,
}: QueryParameters) {
  const { formatMessage } = useIntl();

  const { data: analytics } = useVisitorsLanguagesLive({
    project_id: projectId,
    start_at: startAtMoment?.local().format('YYYY-MM-DD'),
    end_at: endAtMoment?.local().format('YYYY-MM-DD'),
  });

  const translations = getTranslations(formatMessage);

  const pieData = analytics ? parsePieData(analytics.data.attributes) : null;

  const xlsxData =
    analytics && pieData
      ? parseExcelData(analytics.data.attributes, translations)
      : null;

  return { pieData, xlsxData };
}
