// i18n
import messages from './messages';
import cardMessages from '../../components/VisitorsTypeCard/messages';

// typings
import { InjectedIntlProps } from 'react-intl';

export interface Translations {
  newVisitors: string;
  returningVisitors: string;
  count: string;
  type: string;
  title: string;
}

export const getTranslations = (
  formatMessage: InjectedIntlProps['intl']['formatMessage']
): Translations => ({
  newVisitors: formatMessage(messages.newVisitors),
  returningVisitors: formatMessage(messages.returningVisitors),
  type: formatMessage(messages.type),
  count: formatMessage(messages.count),
  title: formatMessage(cardMessages.title),
});
