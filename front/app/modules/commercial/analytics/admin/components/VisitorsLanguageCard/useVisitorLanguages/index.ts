import { Query, QuerySchema } from 'api/analytics/types';
import useAnalytics from 'api/analytics/useAnalytics';

import {
  getProjectFilter,
  getDateFilter,
} from 'components/admin/GraphCards/_utils/query';

import { useIntl } from 'utils/cl-intl';

import { parsePieData, parseExcelData } from './parse';
import { getTranslations } from './translations';
import { Response, QueryParameters } from './typings';

const query = ({
  projectId,
  startAtMoment,
  endAtMoment,
}: QueryParameters): Query => {
  const localesCountQuery: QuerySchema = {
    fact: 'visit',
    filters: {
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
