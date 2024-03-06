import useAnalytics from 'api/analytics/useAnalytics';

import { useIntl } from 'utils/cl-intl';

import { getPageNumberFromUrl } from '../../_utils/pagination';

import { parseTableData } from './parse';
import { referrersListQuery, referrersTotalQuery } from './query';
import { getTranslations } from './translations';
import {
  QueryParameters,
  ReferrerListResponse,
  ReferrerTotalsResponse,
} from './typings';

export default function useVisitorReferrers({
  projectId,
  startAtMoment,
  endAtMoment,
  pageNumber,
  pageSize,
}: QueryParameters) {
  const { formatMessage } = useIntl();

  const { data: totalsData } = useAnalytics<ReferrerTotalsResponse>(
    referrersTotalQuery({
      projectId,
      startAtMoment,
      endAtMoment,
    })
  );

  const { data: analytics } = useAnalytics<ReferrerListResponse>(
    referrersListQuery({
      projectId,
      startAtMoment,
      endAtMoment,
      pageNumber,
      pageSize,
    })
  );

  const totals = totalsData ? totalsData.data.attributes[0] : null;
  const translations = getTranslations(formatMessage);
  const tableData =
    analytics && totals
      ? parseTableData(analytics.data.attributes, totals, translations)
      : null;
  const pages =
    analytics && totals ? getPageNumberFromUrl(analytics.links.last) : null;

  return { tableData, pages };
}
