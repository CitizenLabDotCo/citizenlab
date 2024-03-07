import { useVisitorsTrafficSourcesLive } from 'api/graph_data_units';
import { formatMoment } from 'api/graph_data_units/utils';

import { ProjectId, Dates } from 'components/admin/GraphCards/typings';

import { useIntl } from 'utils/cl-intl';

import { parsePieData, parseExcelData } from './parse';
import { getTranslations } from './translations';

type QueryParameters = ProjectId & Dates;

export default function useVisitorsReferrerTypes({
  projectId,
  startAtMoment,
  endAtMoment,
}: QueryParameters) {
  const { data: analytics } = useVisitorsTrafficSourcesLive({
    project_id: projectId,
    start_at: formatMoment(startAtMoment),
    end_at: formatMoment(endAtMoment),
  });

  const { formatMessage } = useIntl();
  const translations = getTranslations(formatMessage);

  const pieData = analytics
    ? parsePieData(analytics.data.attributes, translations)
    : null;
  const xlsxData = pieData ? parseExcelData(pieData, translations) : null;

  return { pieData, xlsxData };
}
