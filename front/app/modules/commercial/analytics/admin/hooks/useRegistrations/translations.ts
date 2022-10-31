// i18n
import messages from './messages';
import visitorsMessages from '../useVisitors/messages';
import cardMessages from '../../components/RegistrationsCard/messages';
import { getTimePeriodTranslations } from '../../utils/resolution';

// typings
import { FormatMessage } from 'typings';

export interface Translations {
  stats: string;
  timeSeries: string;
  date: string;
  registrations: string;
  statistic: string;
  conversionRate: string;
  total: string;
  last30Days: string;
  last7Days: string;
  yesterday: string;
}

export const getTranslations = (
  formatMessage: FormatMessage
): Translations => ({
  stats: formatMessage(visitorsMessages.stats),
  timeSeries: formatMessage(messages.timeSeries),
  date: formatMessage(visitorsMessages.date),
  registrations: formatMessage(cardMessages.registrations),
  statistic: formatMessage(visitorsMessages.statistic),
  conversionRate: formatMessage(cardMessages.conversionRate),
  total: formatMessage(visitorsMessages.total),
  ...getTimePeriodTranslations(formatMessage),
});
