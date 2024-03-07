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
  const analytics = useVisitorsTrafficSources({
    project_id: projectId,
    start_at: startAt,
    end_at: endAt,
  });

  const { formatMessage } = useIntl();
  const translations = getTranslations(formatMessage);

  const pieData = analytics
    ? parsePieData(analytics.data.attributes, translations)
    : null;

  return { pieData };
}
