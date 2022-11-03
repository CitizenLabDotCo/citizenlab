// i18n
import messages from './messages';

// typings
import { FormatMessage } from 'typings';

export interface Translations {
  'Direct Entry': string;
  'Social Networks': string;
  'Search Engines': string;
  Websites: string;
  Campaigns: string;
}

export const getTranslations = (
  formatMessage: FormatMessage
): Translations => ({
  'Direct Entry': formatMessage(messages.directEntry),
  'Social Networks': formatMessage(messages.socialNetwork),
  'Search Engines': formatMessage(messages.searchEngine),
  Websites: formatMessage(messages.website),
  Campaigns: formatMessage(messages.campaign),
});
