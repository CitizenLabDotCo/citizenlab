import { FormatMessage } from 'typings';

import moduleMessages from 'components/admin/GraphCards/messages';

import cardMessages from '../messages';

import messages from './messages';

export interface Translations {
  stats: string;
  timeSeries: string;
  statistic: string;
  total: string;
  date: string;
  custom: string;
  customCampaigns: string;
  automated: string;
  automatedCampaigns: string;
}

export const getTranslations = (
  formatMessage: FormatMessage
): Translations => ({
  stats: formatMessage(moduleMessages.stats),
  timeSeries: formatMessage(messages.timeSeries),
  statistic: formatMessage(moduleMessages.statistic),
  date: formatMessage(moduleMessages.date),
  total: formatMessage(cardMessages.totalEmailsSent),
  custom: formatMessage(cardMessages.customEmails),
  customCampaigns: formatMessage(cardMessages.customCampaigns),
  automated: formatMessage(cardMessages.automatedEmails),
  automatedCampaigns: formatMessage(cardMessages.automatedCampaigns),
});
