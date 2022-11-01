import { FormatMessage } from 'typings';
import visitorsMessages from '../useVisitors/messages';
import messages from './messages';
import cardMessages from '../../components/RegistrationsCard/messages';
import visitorsCardMessages from '../../components/VisitorsCard/messages';

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
  last30Days: formatMessage(visitorsCardMessages.last30Days),
  last7Days: formatMessage(visitorsCardMessages.last7Days),
  yesterday: formatMessage(visitorsCardMessages.yesterday),
});
