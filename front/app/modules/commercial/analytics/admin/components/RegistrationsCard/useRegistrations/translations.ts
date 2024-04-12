import { FormatMessage } from 'typings';

import { getTimePeriodTranslations } from 'components/admin/GraphCards/_utils/resolution';
import moduleMessages from 'components/admin/GraphCards/messages';

import cardMessages from '../messages';

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
