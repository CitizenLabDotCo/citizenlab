// i18n
// typings
import { FormatMessage } from 'typings';
import { getTimePeriodTranslations } from '../../utils/resolution';
import cardMessages from '../../components/RegistrationsCard/messages';
import moduleMessages from '../../messages';
import messages from './messages';

export interface Translations {
  stats: string;
  timeSeries: string;
  date: string;
  registrations: string;
  statistic: string;
  registrationRate: string;
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
  registrations: formatMessage(cardMessages.registrations),
  statistic: formatMessage(moduleMessages.statistic),
  registrationRate: formatMessage(cardMessages.registrationRate),
  total: formatMessage(moduleMessages.total),
  ...getTimePeriodTranslations(formatMessage),
});
