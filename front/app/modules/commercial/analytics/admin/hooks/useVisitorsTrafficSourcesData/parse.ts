// styling
import { categoricalColorScheme } from 'components/admin/Graphs/styling';

// i18n
import messages from './messages';
import { roundPercentages } from 'utils/math';

// typings
import { InjectedIntlProps } from 'react-intl';
import { Response, PieRow, ReferrerTypeName } from './typings';
import { MessageDescriptor } from 'utils/cl-intl';

const REFERRER_TYPE_MESSAGES: Record<ReferrerTypeName, MessageDescriptor> = {
  'Direct Entry': messages.directEntry,
  'Social Networks': messages.socialNetworks,
  'Search Engines': messages.searchEngines,
  Websites: messages.websites,
  Campaigns: messages.campaigns,
};

export const parsePieData = (
  formatMessage: InjectedIntlProps['intl']['formatMessage'],
  data: Response['data']
): PieRow[] | null => {
  if (data.length === 0) return null;

  const counts = data.map(({ count }) => count);
  const percentages = roundPercentages(counts);

  return data.map((row, i) => ({
    name: formatMessage(
      REFERRER_TYPE_MESSAGES[row.first_dimension_referrer_type_name]
    ),
    value: row.count,
    percentage: percentages[i],
    color: categoricalColorScheme({ rowIndex: i }),
  }));
};
