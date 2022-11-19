'use strict';
exports.__esModule = true;
exports.appLocalesMomentPairs =
  exports.shortenedAppLocalePairs =
  exports.appGraphqlLocalePairs =
  exports.appLocalePairs =
  exports.locales =
  exports.DEFAULT_LOCALE =
  exports.GRAPHQL_PORT =
  exports.GRAPHQL_HOST =
  exports.API_PORT =
  exports.API_HOST =
  exports.GOOGLE_MAPS_API_KEY =
  exports.API_PATH =
  exports.AUTH_PATH =
    void 0;
exports.AUTH_PATH = '/auth';
exports.API_PATH = '/web_api/v1';
exports.GOOGLE_MAPS_API_KEY = process.env.GOOGLE_MAPS_API_KEY || '';
exports.API_HOST =
  process.env.API_HOST ||
  (typeof window === 'undefined' ? 'localhost' : window.location.hostname);
exports.API_PORT = process.env.API_PORT || 4000;
exports.GRAPHQL_HOST =
  process.env.GRAPHQL_HOST ||
  (typeof window === 'undefined' ? 'localhost' : window.location.hostname);
exports.GRAPHQL_PORT = process.env.GRAPHQL_PORT || 5001;
exports.DEFAULT_LOCALE = 'en';
// the locales we "support" :
// platformBaseUrl/{oneOfTheseStrings}/{anything we have a route for}
// - won't 404
// - will replace the oneOfTheseStrings with authUser's locale if there is one
// - else, will replace the oneOfTheseStrings with the one if the cookie if it exists
// - else, will replce the oneOfTheseStrings with the first locale of the platfom (default)
exports.locales = [
  'ar-MA',
  'ar-SA',
  'ca-ES',
  'da',
  'da-DK',
  'de',
  'el-GR',
  'de-DE',
  'en',
  'en-CA',
  'en-GB',
  'es',
  'es-CL',
  'es-ES',
  'fr',
  'fr-BE',
  'fr-FR',
  'hr-HR',
  'hu-HU',
  'it-IT',
  'kl-GL',
  'lb-LU',
  'lv-LV',
  'mi',
  'nb',
  'nb-NO',
  'nl',
  'nl-BE',
  'nl-NL',
  'pl-PL',
  'pt-BR',
  'ro-RO',
  'sr-Latn',
  'sr-SP',
  'sv-SE',
  'tr-TR',
];
// the locales we really support, ie we have translations for these ect
exports.appLocalePairs = {
  'ar-MA': 'عربي',
  'ar-SA': 'عربى',
  'ca-ES': 'Català',
  'da-DK': 'Dansk',
  'de-DE': 'Deutsch',
  'el-GR': 'Ελληνικά',
  en: 'English',
  'en-CA': 'English (Canada)',
  'en-GB': 'English (Great Britain)',
  'es-CL': 'Español (Chile)',
  'es-ES': 'Español (España)',
  'fr-BE': 'Français (Belgique)',
  'fr-FR': 'Français (France)',
  'hr-HR': 'Hrvatski',
  'hu-HU': 'Magyar',
  'it-IT': 'Italiano',
  'kl-GL': 'Kalaallisut',
  'lb-LU': 'Lëtzebuergesch',
  'lv-LV': 'Latviešu',
  mi: 'Māori',
  'nb-NO': 'Norsk (Bokmål)',
  'nl-BE': 'Nederlands (België)',
  'nl-NL': 'Nederlands (Nederland)',
  'pl-PL': 'Polski',
  'pt-BR': 'Português (Brasil)',
  'ro-RO': 'Română',
  'sr-Latn': 'Srpski (Latinica)',
  'sr-SP': 'Српски (Ћирилица)',
  'sv-SE': 'Svenska',
  'tr-TR': 'Türkçe',
};
exports.appGraphqlLocalePairs = {
  arMa: 'ar-MA',
  arSa: 'ar',
  caEs: 'ca',
  da: 'da',
  daDk: 'da-DK',
  de: 'de',
  deDe: 'de-DE',
  elGr: 'el-GR',
  en: 'en',
  enCa: 'en-CA',
  enGb: 'en-GB',
  es: 'es',
  esCl: 'es-CL',
  esEs: 'es-ES',
  fr: 'fr',
  frBe: 'fr-BE',
  frFr: 'fr-FR',
  hrHr: 'hr-HR',
  huHu: 'hu-HU',
  itIt: 'it-IT',
  klGl: 'kl-GL',
  lbLu: 'lb-LU',
  lvLv: 'lv-LV',
  mi: 'mi',
  nb: 'nb',
  nbNo: 'nb-NO',
  nl: 'nl',
  nlBe: 'nl-BE',
  nlNl: 'nl-NL',
  plPl: 'pl-PL',
  ptBr: 'pt-BR',
  roRo: 'ro-RO',
  srLatn: 'sr-Latn',
  srSp: 'sr-SP',
  svSe: 'sv-SE',
  trTr: 'tr-TR',
};
exports.shortenedAppLocalePairs = {
  'ar-MA': 'عربي',
  'ar-SA': 'عربى',
  'ca-ES': 'Català',
  'da-DK': 'Dansk',
  'de-DE': 'Deutsch',
  'el-GR': 'Ελληνικά',
  en: 'English',
  'en-CA': 'English',
  'en-GB': 'English',
  'es-CL': 'Español',
  'es-ES': 'Español',
  'fr-BE': 'Français',
  'fr-FR': 'Français',
  'hr-HR': 'Hrvatski',
  'hu-HU': 'Magyar',
  'it-IT': 'Italiano',
  'kl-GL': 'Kalaallisut',
  'lb-LU': 'Lëtzebuergesch',
  'lv-LV': 'Latviešu',
  mi: 'Māori',
  'nb-NO': 'Norsk',
  'nl-BE': 'Nederlands',
  'nl-NL': 'Nederlands',
  'pl-PL': 'Polski',
  'pt-BR': 'Português',
  'ro-RO': 'Română',
  'sr-Latn': 'Srpski',
  'sr-SP': 'Српски',
  'sv-SE': 'Svenska',
  'tr-TR': 'Türkçe',
};
// https://github.com/moment/moment/tree/develop/locale lists the supported locales by moment.js
exports.appLocalesMomentPairs = {
  'ar-MA': 'ar-ma',
  'ar-SA': 'ar',
  'ca-ES': 'ca',
  'da-DK': 'da',
  'de-DE': 'de',
  'el-GR': 'el',
  'en-CA': 'en-ca',
  'en-GB': 'en-gb',
  'es-CL': 'es',
  'es-ES': 'es',
  'fr-BE': 'fr',
  'fr-FR': 'fr',
  'hr-HR': 'hr',
  'hu-HU': 'hu',
  'it-IT': 'it',
  'kl-GL': 'da',
  'lb-LU': 'lb',
  'lv-LV': 'lv',
  mi: 'mi',
  'nb-NO': 'nb',
  'nl-BE': 'nl',
  'nl-NL': 'nl',
  'pl-PL': 'pl',
  'pt-BR': 'pt',
  'ro-RO': 'ro',
  'sr-Latn': 'sr',
  'sr-SP': 'sr',
  'sv-SE': 'sv',
  'tr-TR': 'tr',
};
