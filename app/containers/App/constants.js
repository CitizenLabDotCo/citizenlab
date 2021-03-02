'use strict';
exports.__esModule = true;
exports.appLocalesMomentPairs = exports.shortenedAppLocalePairs = exports.appGraphqlLocalePairs = exports.appLocalePairs = exports.graphqlLocales = exports.locales = exports.DEFAULT_LOCALE = exports.GRAPHQL_PORT = exports.GRAPHQL_HOST = exports.API_PORT = exports.API_HOST = exports.GOOGLE_MAPS_API_KEY = exports.ADMIN_TEMPLATES_GRAPHQL_PATH = exports.API_PATH = exports.AUTH_PATH = void 0;
exports.AUTH_PATH = '/auth';
exports.API_PATH = '/web_api/v1';
exports.ADMIN_TEMPLATES_GRAPHQL_PATH = '/admin_templates_api/graphql';
exports.GOOGLE_MAPS_API_KEY = 'AIzaSyDRtFe1KRBnGfDy_ijw6yCYsYnEkQRl9Cw';
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
  'en',
  'fr',
  'de',
  'nl',
  'nb',
  'da',
  'es',
  'de-DE',
  'en-GB',
  'en-CA',
  'fr-BE',
  'fr-FR',
  'nl-BE',
  'nl-NL',
  'da-DK',
  'nb-NO',
  'es-ES',
  'es-CL',
  'pl-PL',
  'kl-GL',
  'hu-HU',
  'ro-RO',
  'pt-BR',
  'ar-SA',
  'mi',
];
exports.graphqlLocales = [
  'en',
  'fr',
  'de',
  'nl',
  'nb',
  'da',
  'es',
  'enGb',
  'enCa',
  'frBe',
  'frFr',
  'nlBe',
  'nlNl',
  'deDe',
  'daDk',
  'nbNo',
  'esEs',
  'esCl',
  'plPl',
  'klGl',
  'huHu',
  'roRo',
  'ptBr',
  'arSa',
  'mi',
];
// the locales we really support, ie we have translations for these ect
exports.appLocalePairs = {
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
  'es-ES': 'Español (España)',
  'es-CL': 'Español (Chile)',
  'pl-PL': 'Polski',
  'kl-GL': 'Kalaallisut',
  'hu-HU': 'Magyar',
  'ro-RO': 'Română',
  'pt-BR': 'Português (Brasil)',
  'ar-SA': 'عربى',
  mi: 'Māori',
};
exports.appGraphqlLocalePairs = {
  en: 'en',
  fr: 'fr',
  de: 'de',
  nl: 'nl',
  nb: 'nb',
  da: 'da',
  es: 'es',
  mi: 'mi',
  enGb: 'en-GB',
  enCa: 'en-CA',
  frBe: 'fr-BE',
  frFr: 'fr-FR',
  nlBe: 'nl-BE',
  nlNl: 'nl-NL',
  deDe: 'de-DE',
  daDk: 'da-DK',
  nbNo: 'nb-NO',
  esEs: 'es-ES',
  esCl: 'es-CL',
  plPl: 'pl-PL',
  klGl: 'kl-GL',
  huHu: 'hu-HU',
  roRo: 'ro-RO',
  ptBr: 'pt-BR',
  arSa: 'ar',
};
exports.shortenedAppLocalePairs = {
  en: 'English',
  'en-GB': 'English',
  'en-CA': 'English',
  'fr-BE': 'Français',
  'fr-FR': 'Français',
  'nl-BE': 'Nederlands',
  'nl-NL': 'Nederlands',
  'de-DE': 'Deutsch',
  'da-DK': 'Dansk',
  'nb-NO': 'Norsk',
  'es-ES': 'Español',
  'es-CL': 'Español',
  'pl-PL': 'Polski',
  'kl-GL': 'Kalaallisut',
  'hu-HU': 'Magyar',
  'ro-RO': 'Română',
  'pt-BR': 'Português',
  'ar-SA': 'عربى',
  mi: 'Māori',
};
// see https://www.ge.com/digital/documentation/predix-services/c_custom_locale_support.html
exports.appLocalesMomentPairs = {
  'en-GB': 'en-gb',
  'en-CA': 'en-ca',
  'fr-BE': 'fr',
  'fr-FR': 'fr',
  'nl-BE': 'nl',
  'nl-NL': 'nl',
  'de-DE': 'de',
  'da-DK': 'da',
  'nb-NO': 'nb',
  'es-ES': 'es',
  'es-CL': 'es',
  'pl-PL': 'pl',
  'kl-GL': 'da',
  'hu-HU': 'hu',
  'ro-RO': 'ro',
  'pt-BR': 'pt',
  'ar-SA': 'ar',
  mi: 'mi',
};
