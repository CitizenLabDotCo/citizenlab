import { SupportedLocale } from 'typings';

import { DEFAULT_LOCALE } from 'containers/App/constants';

const enTranslationMessages = require('translations/en.json');

export const formatTranslationMessages = (
  locale: SupportedLocale,
  messages: { translateId: string }
) => {
  const defaultFormattedMessages =
    locale !== DEFAULT_LOCALE
      ? formatTranslationMessages(DEFAULT_LOCALE, enTranslationMessages)
      : {};
  return Object.keys(messages).reduce((formattedMessages, key) => {
    let message = messages[key];
    if (!message && locale !== DEFAULT_LOCALE) {
      message = defaultFormattedMessages[key];
    }
    return Object.assign(formattedMessages, { [key]: message });
  }, {});
};
