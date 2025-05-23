import { FormatMessage } from 'typings';

import cardMessages from '../messages';

import messages from './messages';

export interface Translations {
  direct_entry: string;
  social_network: string;
  seach_engine: string;
  sso_redirect: string;
  other: string;
  campaign: string;
  trafficSources: string;
  trafficSource: string;
  numberOfVisits: string;
  percentageOfVisits: string;
  referrerWebsites: string;
  referrer: string;
  numberOfVisitors: string;
}

export const getTranslations = (
  formatMessage: FormatMessage
): Translations => ({
  direct_entry: formatMessage(messages.directEntry),
  social_network: formatMessage(messages.socialNetworks),
  seach_engine: formatMessage(messages.searchEngines),
  sso_redirect: formatMessage(messages.ssoRedirects),
  other: formatMessage(messages.websites),
  campaign: formatMessage(messages.campaigns),
  trafficSources: formatMessage(cardMessages.visitorsTrafficSources),
  trafficSource: formatMessage(messages.trafficSource),
  numberOfVisits: formatMessage(messages.numberOfVisits),
  percentageOfVisits: formatMessage(messages.percentageOfVisits),
  referrerWebsites: formatMessage(messages.referrerWebsites),
  referrer: formatMessage(messages.referrer),
  numberOfVisitors: formatMessage(messages.numberOfVisitors),
});
