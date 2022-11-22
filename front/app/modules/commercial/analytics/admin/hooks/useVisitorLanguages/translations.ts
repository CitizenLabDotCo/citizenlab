// i18n
import cardMessages from '../../components/VisitorsLanguageCard/messages';
import messages from './messages';

// typings
import { FormatMessage } from 'typings';

export interface Translations {
  language: string;
  count: string;
  title: string;
}

export const getTranslations = (
  formatMessage: FormatMessage
): Translations => ({
  language: formatMessage(messages.language),
  count: formatMessage(messages.count),
  title: formatMessage(cardMessages.title),
});
