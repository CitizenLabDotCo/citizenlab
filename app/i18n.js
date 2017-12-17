/**
 * i18n.js
 *
 * This will setup the i18n language files and locale data for your app.
 *
 */
import { addLocaleData } from 'react-intl';
import enLocaleData from 'react-intl/locale-data/en';
import frLocaleData from 'react-intl/locale-data/fr';
import nlLocaleData from 'react-intl/locale-data/nl';
import deLocaleData from 'react-intl/locale-data/de';
import achLocaleData from './utils/ach';


import { DEFAULT_LOCALE } from './containers/App/constants'; // eslint-disable-line
import enTranslationMessages from './translations/en.json';
import frTranslationMessages from './translations/fr.json';
import nlTranslationMessages from './translations/nl.json';
import deTranslationMessages from './translations/de.json';
// This is a "fake" language that is used by the crowdin plugin
import achTranslationMessages from './translations/ach.json';

export const appLocalePairs = {
  en: 'English',
  fr: 'Français',
  nl: 'Nederlands',
  de: 'Deutsch',
  ach: 'Acholi',
};

if (process.env.CROWDIN_PLUGIN_ENABLED) {
  addLocaleData(achLocaleData);
} else {
  addLocaleData(enLocaleData);
  addLocaleData(frLocaleData);
  addLocaleData(nlLocaleData);
  addLocaleData(deLocaleData);
}

export const formatTranslationMessages = (locale, messages) => {
  const defaultFormattedMessages = locale !== DEFAULT_LOCALE
    ? formatTranslationMessages(DEFAULT_LOCALE, process.env.CROWDIN_PLUGIN_ENABLED ? achTranslationMessages : enTranslationMessages)
    : {};
  return Object.keys(messages).reduce((formattedMessages, key) => {
    let message = messages[key];
    if (!message && locale !== DEFAULT_LOCALE) {
      message = defaultFormattedMessages[key];
    }
    return Object.assign(formattedMessages, { [key]: message });
  }, {});
};

const translationMessages = {};
if (process.env.CROWDIN_PLUGIN_ENABLED) {
  translationMessages.ach = formatTranslationMessages('ach', achTranslationMessages);
  document.write('<script type="text/javascript">var _jipt = [];_jipt.push(["project", "cl2-front"]);</script>');
  document.write('<script type="text/javascript" src="//cdn.crowdin.com/jipt/jipt.js"></script>');
} else {
  translationMessages.en = formatTranslationMessages('en', enTranslationMessages);
  translationMessages.fr = formatTranslationMessages('fr', frTranslationMessages);
  translationMessages.nl = formatTranslationMessages('nl', nlTranslationMessages);
  translationMessages.de = formatTranslationMessages('de', deTranslationMessages);
}

export { translationMessages };
