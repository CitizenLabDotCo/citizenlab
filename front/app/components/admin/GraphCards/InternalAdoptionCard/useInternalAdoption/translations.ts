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
  total: string;
  activeAdmins: string;
  activeModerators: string;
  totalAdminPm: string;
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
  total: formatMessage(moduleMessages.total),
  activeAdmins: formatMessage(cardMessages.activeAdmins),
  activeModerators: formatMessage(cardMessages.activeModerators),
  totalAdminPm: formatMessage(cardMessages.totalAdminPm),
  totalActive: formatMessage(cardMessages.totalActive),
  ...getTimePeriodTranslations(formatMessage),
});
