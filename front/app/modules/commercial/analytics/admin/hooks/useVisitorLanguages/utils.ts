// i18n
import messages from './messages';
import cardMessages from '../../components/VisitorsLanguageCard/messages';

// typings
import { WrappedComponentProps } from 'react-intl';

export interface Translations {
  language: string;
  count: string;
  title: string;
}

export const getTranslations = (
  formatMessage: WrappedComponentProps['intl']['formatMessage']
): Translations => ({
  language: formatMessage(messages.language),
  count: formatMessage(messages.count),
  title: formatMessage(cardMessages.title),
});
