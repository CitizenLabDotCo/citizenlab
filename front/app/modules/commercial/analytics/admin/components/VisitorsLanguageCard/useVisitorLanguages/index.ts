// services
import { Query, QuerySchema } from 'api/analytics/types';

// i18n
import { useIntl } from 'utils/cl-intl';
import { getTranslations } from './translations';

// parse
import { parsePieData, parseExcelData } from './parse';

// typings
import { Response, QueryParameters } from './typings';

// utils
import {
  getProjectFilter,
  getDateFilter,
} from 'components/admin/GraphCards/_utils/query';
import useAnalytics from 'api/analytics/useAnalytics';

const query = ({
  projectId,
  startAtMoment,
  endAtMoment,
}: QueryParameters): Query => {
  const localesCountQuery: QuerySchema = {
    fact: 'visit',
    filters: {
      'dimension_user.role': ['citizen', null],
      ...getProjectFilter('dimension_projects', projectId),
      ...getDateFilter(
        'dimension_date_first_action',
        startAtMoment,
        endAtMoment
      ),
    },
    groups: 'dimension_locales.id',
    aggregations: {
      visitor_id: 'count',
      'dimension_locales.name': 'first',
    },
  };

  return {
    query: localesCountQuery,
  };
};

export default function useVisitorsData({
  projectId,
  startAtMoment,
  endAtMoment,
}: QueryParameters) {
  const { formatMessage } = useIntl();

  const { data: analytics } = useAnalytics<Response>(
    query({
      projectId,
      startAtMoment,
      endAtMoment,
    })
  );

  const translations = getTranslations(formatMessage);

  const pieData = analytics ? parsePieData(analytics.data.attributes) : null;

  const xlsxData =
    analytics && pieData
      ? parseExcelData(analytics.data.attributes, translations)
      : null;

  return { pieData, xlsxData };
}
