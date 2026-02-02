import { FormatMessage } from 'typings';

import { getTimePeriodTranslations } from 'components/admin/GraphCards/_utils/resolution';
import moduleMessages from 'components/admin/GraphCards/messages';

import cardMessages from '../messages';

import messages from './messages';

export interface Translations {
  stats: string;
  timeSeries: string;
  date: string;
  statistic: string;
  registered: string;
  active: string;
  admins: string;
  moderators: string;
  total: string;
  activeAdmins: string;
  activeModerators: string;
  totalActive: string;
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
  statistic: formatMessage(moduleMessages.statistic),
  registered: formatMessage(cardMessages.registered),
  active: formatMessage(cardMessages.active),
  admins: formatMessage(cardMessages.admins),
  moderators: formatMessage(cardMessages.moderators),
  total: formatMessage(cardMessages.total),
  activeAdmins: formatMessage(cardMessages.activeAdmins),
  activeModerators: formatMessage(cardMessages.activeModerators),
  totalActive: formatMessage(cardMessages.totalActive),
  ...getTimePeriodTranslations(formatMessage),
});
