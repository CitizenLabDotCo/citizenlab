import { DEFAULT_LOCALE } from 'containers/App/constants';

import { Locale } from 'typings';

const enTranslationMessages = require('translations/en.json');

export const formatTranslationMessages = (
  locale: Locale,
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
