import { useVisitorsTrafficSourcesLive } from 'api/graph_data_units';

import { ProjectId, Dates } from 'components/admin/GraphCards/typings';

import { useIntl } from 'utils/cl-intl';
import { momentToIsoDate } from 'utils/dateUtils';

import { parsePieData, parseTableData, parseExcelData } from './parse';
import { getTranslations } from './translations';

type QueryParameters = ProjectId & Dates;

export default function useVisitorsReferrerTypes({
  projectId,
  startAtMoment,
  endAtMoment,
}: QueryParameters) {
  const { data } = useVisitorsTrafficSourcesLive({
    project_id: projectId,
    start_at: momentToIsoDate(startAtMoment),
    end_at: momentToIsoDate(endAtMoment),
  });

  const { formatMessage } = useIntl();
  const translations = getTranslations(formatMessage);

  const pieData = data
    ? parsePieData(data.data.attributes, translations)
    : undefined;

  const tableData = data
    ? parseTableData(data.data.attributes, translations)
    : undefined;

  const xlsxData =
    pieData && tableData
      ? parseExcelData(pieData, tableData, translations)
      : undefined;

  return { pieData, tableData, xlsxData };
}
