import { addLocaleData } from 'react-intl';
import enLocaleData from 'react-intl/locale-data/en';
import frLocaleData from 'react-intl/locale-data/fr';
import nlLocaleData from 'react-intl/locale-data/nl';
import deLocaleData from 'react-intl/locale-data/de';
import daLocaleData from 'react-intl/locale-data/da';
import nbLocaleData from 'react-intl/locale-data/nb';
import achLocaleData from 'utils/ach';
import { DEFAULT_LOCALE } from 'containers/App/constants';

const enTranslationMessages = require('translations/en.json');
const enGBTranslationMessages = require('translations/en-GB.json');
const enCATranslationMessages = require('translations/en-CA.json');
const frBETranslationMessages = require('translations/fr-BE.json');
const frFRTranslationMessages = require('translations/fr-FR.json');
const nlBETranslationMessages = require('translations/nl-BE.json');
const nlNLTranslationMessages = require('translations/nl-NL.json');
const deDETranslationMessages = require('translations/de-DE.json');
const daDKTranslationMessages = require('translations/da-DK.json');
const nbNOTranslationMessages = require('translations/nb-NO.json');
const achTranslationMessages = require('translations/ach-UG.json');

if (process.env.CROWDIN_PLUGIN_ENABLED) {
  addLocaleData(achLocaleData as any);
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
  translationMessages['ach'] = formatTranslationMessages('ach', achTranslationMessages);
  document.write('<script type="text/javascript">var _jipt = [];_jipt.push(["project", "cl2-front"]);</script>');
  document.write('<script type="text/javascript" src="//cdn.crowdin.com/jipt/jipt.js"></script>');
} else {
  translationMessages['en'] = formatTranslationMessages('en', enTranslationMessages);
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
