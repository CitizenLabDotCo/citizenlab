// i18n
import messages from './messages';
import cardMessages from '../../components/VisitorsTypeCard/messages';

// typings
import { WrappedComponentProps } from 'react-intl';

export interface Translations {
  newVisitors: string;
  returningVisitors: string;
  count: string;
  type: string;
  title: string;
}

export const getTranslations = (
  formatMessage: WrappedComponentProps['intl']['formatMessage']
): Translations => ({
  newVisitors: formatMessage(messages.newVisitors),
  returningVisitors: formatMessage(messages.returningVisitors),
  type: formatMessage(messages.type),
  count: formatMessage(messages.count),
  title: formatMessage(cardMessages.title),
});
