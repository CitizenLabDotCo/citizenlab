// utils
import { roundPercentage } from 'utils/math';

// i18n
import messages from './messages';

// typings
import { ReferrerRow, ReferrersTotalRow, TableRow } from './typings';
import { ReferrerTypeName } from '../useVisitorReferrerTypes/typings';
import { MessageDescriptor } from 'utils/cl-intl';
import { WrappedComponentProps } from 'react-intl';

const REFERRER_TYPE_SINGULAR_MESSAGES: Record<
  ReferrerTypeName,
  MessageDescriptor
> = {
  'Direct Entry': messages.directEntry,
  'Social Networks': messages.socialNetwork,
  'Search Engines': messages.searchEngine,
  Websites: messages.website,
  Campaigns: messages.campaign,
};

export const parseTableData = (
  referrerRows: ReferrerRow[],
  { count: totalVisits, count_visitor_id: totalVisitors }: ReferrersTotalRow,
  formatMessage: WrappedComponentProps['intl']['formatMessage']
): TableRow[] | null => {
  if (referrerRows.length === 0) return null;
  if (!totalVisits || !totalVisitors) return null;

  return referrerRows.map((row) => ({
    visits: row.count,
    visitsPercentage: roundPercentage(row.count, totalVisits),
    visitors: row.count_visitor_id,
    visitorsPercentage: roundPercentage(row.count_visitor_id, totalVisitors),
    referrerType: formatMessage(
      REFERRER_TYPE_SINGULAR_MESSAGES[row['dimension_referrer_type.name']]
    ),
    referrerName: row.referrer_name ?? '',
  }));
};
