import { useVisitorsTrafficSources } from 'api/graph_data_units';

import { ProjectId, DatesStrings } from 'components/admin/GraphCards/typings';
import { parsePieData } from 'components/admin/GraphCards/VisitorsTrafficSourcesCard/useVisitorReferrerTypes/parse';
import { getTranslations } from 'components/admin/GraphCards/VisitorsTrafficSourcesCard/useVisitorReferrerTypes/translations';

import { useIntl } from 'utils/cl-intl';

type QueryParameters = ProjectId & DatesStrings;

export default function useVisitorsReferrerTypes({
  projectId,
  startAt,
  endAt,
}: QueryParameters) {
  const { data } = useVisitorsTrafficSources({
    project_id: projectId,
    start_at: startAt,
    end_at: endAt,
  });

  const { formatMessage } = useIntl();
  const translations = getTranslations(formatMessage);

  const pieData = data
    ? parsePieData(data.data.attributes, translations)
    : undefined;

  const tableData = data?.data.attributes.top_50_referrers.map(
    ({ referrer_type, ...rest }) => ({
      ...rest,
      referrer_type: translations[referrer_type],
    })
  );

  return { pieData, tableData };
}
