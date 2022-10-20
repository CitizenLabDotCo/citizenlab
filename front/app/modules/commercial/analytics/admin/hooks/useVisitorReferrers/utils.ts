// i18n
import messages from './messages';

// typings
import { WrappedComponentProps } from 'react-intl';

export interface Translations {
  'Direct Entry': string;
  'Social Networks': string;
  'Search Engines': string;
  Websites: string;
  Campaigns: string;
}

export const getTranslations = (
  formatMessage: WrappedComponentProps['intl']['formatMessage']
): Translations => ({
  'Direct Entry': formatMessage(messages.directEntry),
  'Social Networks': formatMessage(messages.socialNetwork),
  'Search Engines': formatMessage(messages.searchEngine),
  Websites: formatMessage(messages.website),
  Campaigns: formatMessage(messages.campaign),
});
