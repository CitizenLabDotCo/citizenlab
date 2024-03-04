import messages from './messages';
import cardMessages from '../messages';

import { FormatMessage } from 'typings';

export interface Translations {
  newVisitors: string;
  returningVisitors: string;
  count: string;
  type: string;
  title: string;
}

export const getTranslations = (
  formatMessage: FormatMessage
): Translations => ({
  newVisitors: formatMessage(messages.newVisitors),
  returningVisitors: formatMessage(messages.returningVisitors),
  type: formatMessage(messages.type),
  count: formatMessage(messages.count),
  title: formatMessage(cardMessages.title),
});
