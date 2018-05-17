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
import daLocaleData from 'react-intl/locale-data/da';
import nbLocaleData from 'react-intl/locale-data/nb';
import achLocaleData from './utils/ach';


// TODO: Import the correct translation files
import { DEFAULT_LOCALE } from './containers/App/constants'; // eslint-disable-line
import enTranslationMessages from './translations/en.json';
const enGBTranslationMessages = enTranslationMessages;
const enCATranslationMessages = enTranslationMessages;
import frTranslationMessages from './translations/fr.json';
const frBETranslationMessages = frTranslationMessages;
const frFRTranslationMessages = frTranslationMessages;
import nlTranslationMessages from './translations/nl.json';
const nlBETranslationMessages = nlTranslationMessages;
const nlNLTranslationMessages = nlTranslationMessages;
import deDETranslationMessages from './translations/de.json';
import daDKTranslationMessages from './translations/da.json';
import nbNOTranslationMessages from './translations/no.json';
// This is a "fake" language that is used by the crowdin plugin
import achTranslationMessages from './translations/ach.json';

export const appLocalePairs = {
  en: 'English',
  'en-GB': 'English (Great Britain)',
  'en-CA': 'English (Canada)',
  'fr-BE': 'Français (Belgique)',
  'fr-FR': 'Français (France)',
  'nl-BE': 'Nederlands (België)',
  'nl-NL': 'Nederlands (Nederland)',
  'de-DE': 'Deutsch',
  'da-DK': 'Dansk',
  'nb-NO': 'Norsk (Bokmål)',
  ach: 'Acholi',
};

if (process.env.CROWDIN_PLUGIN_ENABLED) {
  addLocaleData(achLocaleData);
} else {
  addLocaleData(enLocaleData);
  addLocaleData(frLocaleData);
  addLocaleData(nlLocaleData);
  addLocaleData(deLocaleData);
  addLocaleData(daLocaleData);
  addLocaleData(nbLocaleData);
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
  translationMessages['en-GB'] = formatTranslationMessages('en-GB', enGBTranslationMessages);
  translationMessages['en-CA'] = formatTranslationMessages('en-CA', enCATranslationMessages);
  translationMessages['fr-BE'] = formatTranslationMessages('fr-BE', frBETranslationMessages);
  translationMessages['fr-FR'] = formatTranslationMessages('fr-FR', frFRTranslationMessages);
  translationMessages['nl-BE'] = formatTranslationMessages('nl-BE', nlBETranslationMessages);
  translationMessages['nl-NL'] = formatTranslationMessages('nl-NL', nlNLTranslationMessages);
  translationMessages['de-DE'] = formatTranslationMessages('de-DE', deDETranslationMessages);
  translationMessages['da-DK'] = formatTranslationMessages('da-DK', daDKTranslationMessages);
  translationMessages['nb-NO'] = formatTranslationMessages('nb-NO', nbNOTranslationMessages);
}

export { translationMessages };
