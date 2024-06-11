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
  const visitorTypesCountQuery: QuerySchema = {
    fact: 'visit',
    filters: {
      ...getProjectFilter('dimension_projects', projectId),
      ...getDateFilter(
        'dimension_date_first_action',
        startAtMoment,
        endAtMoment
      ),
    },
    groups: 'returning_visitor',
    aggregations: {
      visitor_id: 'count',
    },
  };

  return {
    query: visitorTypesCountQuery,
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
  const pieData = analytics
    ? parsePieData(analytics.data.attributes, translations)
    : null;

  const xlsxData =
    analytics && pieData ? parseExcelData(pieData, translations) : null;

  return { pieData, xlsxData };
}
