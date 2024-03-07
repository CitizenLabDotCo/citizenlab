import { FormatMessage } from 'typings';

import cardMessages from '../messages';

import messages from './messages';

export interface Translations {
  'Direct Entry': string;
  'Social Networks': string;
  'Search Engines': string;
  Websites: string;
  Campaigns: string;
  trafficSources: string;
  trafficSource: string;
  numberOfVisits: string;
  percentageOfVisits: string;
}

export const getTranslations = (
  formatMessage: FormatMessage
): Translations => ({
  'Direct Entry': formatMessage(messages.directEntry),
  'Social Networks': formatMessage(messages.socialNetworks),
  'Search Engines': formatMessage(messages.searchEngines),
  Websites: formatMessage(messages.websites),
  Campaigns: formatMessage(messages.campaigns),
  trafficSources: formatMessage(cardMessages.visitorsTrafficSources),
  trafficSource: formatMessage(messages.trafficSource),
  numberOfVisits: formatMessage(messages.numberOfVisits),
  percentageOfVisits: formatMessage(messages.percentageOfVisits),
});
