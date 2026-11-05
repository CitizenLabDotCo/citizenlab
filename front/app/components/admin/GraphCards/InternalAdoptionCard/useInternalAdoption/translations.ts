import { FormatMessage } from 'typings';

import moduleMessages from 'components/admin/GraphCards/messages';
import { IResolution } from 'components/admin/ResolutionControl';

import cardMessages from '../messages';

import messages from './messages';

export const getActiveTimePeriodLabel = (
  formatMessage: FormatMessage,
  resolution: IResolution
) => {
  const messageKey = {
    month: cardMessages.activeLast30Days,
    week: cardMessages.activeLast7Days,
    day: cardMessages.activeYesterday,
  }[resolution];
  return formatMessage(messageKey);
};

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
  activePeriodLabel: string;
}

export const getTranslations = (
  formatMessage: FormatMessage,
  resolution: IResolution
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
  activePeriodLabel: getActiveTimePeriodLabel(formatMessage, resolution),
});
