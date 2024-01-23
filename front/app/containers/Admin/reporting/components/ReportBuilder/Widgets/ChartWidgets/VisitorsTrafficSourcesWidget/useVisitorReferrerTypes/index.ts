// i18n
import { useIntl } from 'utils/cl-intl';
import { getTranslations } from 'components/admin/GraphCards/VisitorsTrafficSourcesCard/useVisitorReferrerTypes/translations';

// parse
import { parsePieData } from 'components/admin/GraphCards/VisitorsTrafficSourcesCard/useVisitorReferrerTypes/parse';

// typings
import {
  QueryParameters,
  Response,
} from 'components/admin/GraphCards/VisitorsTrafficSourcesCard/useVisitorReferrerTypes/typings';

import useGraphDataUnits from 'api/graph_data_units/useGraphDataUnits';

export default function useVisitorsReferrerTypes({
  projectId,
  startAtMoment,
  endAtMoment,
}: QueryParameters) {
  const analytics = useGraphDataUnits<Response>({
    resolvedName: 'VisitorsTrafficSourcesWidget',
    props: {
      projectId,
      startAtMoment,
      endAtMoment,
    },
  });

  const { formatMessage } = useIntl();
  const translations = getTranslations(formatMessage);

  const pieData = analytics
    ? parsePieData(analytics.data.attributes, translations)
    : null;

  return { pieData };
}
