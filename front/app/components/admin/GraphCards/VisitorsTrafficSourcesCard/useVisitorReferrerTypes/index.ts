import { useVisitorsTrafficSourcesLive } from 'api/graph_data_units';

import { useIntl } from 'utils/cl-intl';

import { parsePieData, parseExcelData } from './parse';
import { getTranslations } from './translations';
import { QueryParameters } from './typings';

export default function useVisitorsReferrerTypes({
  projectId,
  startAtMoment,
  endAtMoment,
}: QueryParameters) {
  const { data: analytics } = useVisitorsTrafficSourcesLive({
    project_id: projectId,
    startAtMoment,
    endAtMoment,
  });

  const { formatMessage } = useIntl();
  const translations = getTranslations(formatMessage);

  const pieData = analytics
    ? parsePieData(analytics.data.attributes, translations)
    : null;
  const xlsxData = pieData ? parseExcelData(pieData, translations) : null;

  return { pieData, xlsxData };
}
