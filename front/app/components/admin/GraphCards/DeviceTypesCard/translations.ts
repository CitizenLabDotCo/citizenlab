import { FormatMessage } from 'typings';

import messages from './messages';

export interface Translations {
  count: string;
  type: string;
  title: string;
  mobile: string;
  tablet: string;
  desktop_or_other: string;
}

export const getTranslations = (
  formatMessage: FormatMessage
): Translations => ({
  type: formatMessage(messages.type),
  count: formatMessage(messages.count),
  title: formatMessage(messages.title),
  mobile: formatMessage(messages.mobile),
  tablet: formatMessage(messages.tablet),
  desktop_or_other: formatMessage(messages.desktop_or_other),
});
