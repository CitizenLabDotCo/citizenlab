// i18n
import messages from './messages';
import moduleMessages from '../../messages';
import cardMessages from '../../components/ActiveUsersCard/messages';
import { getTimePeriodTranslations } from '../../utils/resolution';

// typings
import { FormatMessage } from 'typings';

export interface Translations {
  stats: string;
  timeSeries: string;
  date: string;
  activeUsers: string;
  statistic: string;
  participationRate: string;
  total: string;
  last30Days: string;
  last7Days: string;
  yesterday: string;
}

export const getTranslations = (
  formatMessage: FormatMessage
): Translations => ({
  stats: formatMessage(moduleMessages.stats),
  timeSeries: formatMessage(messages.timeSeries),
  date: formatMessage(moduleMessages.date),
  activeUsers: formatMessage(cardMessages.activeUsers),
  statistic: formatMessage(moduleMessages.statistic),
  participationRate: formatMessage(cardMessages.participationRate),
  total: formatMessage(moduleMessages.total),
  ...getTimePeriodTranslations(formatMessage),
});
