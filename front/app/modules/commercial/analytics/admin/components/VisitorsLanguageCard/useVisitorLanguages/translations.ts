import { FormatMessage } from 'typings';

import cardMessages from '../messages';

import messages from './messages';

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
