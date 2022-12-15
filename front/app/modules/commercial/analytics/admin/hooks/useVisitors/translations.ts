// i18n
import messages from './messages';
import moduleMessages from '../../messages';
import cardMessages from '../../components/VisitorsCard/messages';
import { getTimePeriodTranslations } from '../../utils/resolution';

// typings
import { FormatMessage } from 'typings';

export interface Translations {
  stats: string;
  timeSeries: string;
  statistic: string;
  total: string;
  date: string;
  visitors: string;
  visits: string;
  visitDuration: string;
  pageViews: string;
  last30Days: string;
  last7Days: string;
  yesterday: string;
}

export const getTranslations = (
  formatMessage: FormatMessage
): Translations => ({
  stats: formatMessage(moduleMessages.stats),
  timeSeries: formatMessage(messages.timeSeries),
  statistic: formatMessage(moduleMessages.statistic),
  total: formatMessage(moduleMessages.total),
  date: formatMessage(moduleMessages.date),
  visitors: formatMessage(cardMessages.visitors),
  visits: formatMessage(cardMessages.visits),
  visitDuration: formatMessage(cardMessages.visitDuration),
  pageViews: formatMessage(cardMessages.pageViews),
  ...getTimePeriodTranslations(formatMessage),
});
