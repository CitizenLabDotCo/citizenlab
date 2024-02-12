// i18n
import { useIntl } from 'utils/cl-intl';
import { getTranslations } from './translations';

// parse
import { parsePieData, parseExcelData } from './parse';

// typings
import { QueryParameters } from './typings';

import { useVisitorsTrafficSourcesLive } from 'api/graph_data_units';

export default function useVisitorsReferrerTypes({
  projectId,
  startAtMoment,
  endAtMoment,
}: QueryParameters) {
  const { data: analytics } = useVisitorsTrafficSourcesLive({
    projectId,
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
