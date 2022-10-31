// i18n
import messages from './messages';
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
  stats: formatMessage(messages.stats),
  timeSeries: formatMessage(messages.timeSeries),
  statistic: formatMessage(messages.statistic),
  total: formatMessage(messages.total),
  date: formatMessage(messages.date),
  visitors: formatMessage(cardMessages.visitors),
  visits: formatMessage(cardMessages.visits),
  visitDuration: formatMessage(cardMessages.visitDuration),
  pageViews: formatMessage(cardMessages.pageViews),
  ...getTimePeriodTranslations(formatMessage),
});
