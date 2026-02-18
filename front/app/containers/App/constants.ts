export const AUTH_PATH = '/auth';
export const API_PATH = '/web_api/v1';
export const API_HOST =
  process.env.API_HOST ||
  (typeof window === 'undefined' ? 'localhost' : window.location.hostname);
export const API_PORT = process.env.API_PORT || 4000;
export const GRAPHQL_HOST =
  process.env.GRAPHQL_HOST ||
  (typeof window === 'undefined' ? 'localhost' : window.location.hostname);
export const GRAPHQL_PORT = process.env.GRAPHQL_PORT || 5001;
export const DEFAULT_LOCALE = 'en';

// the locales we "support" :
// platformBaseUrl/{oneOfTheseStrings}/{anything we have a route for}
// - won't 404
// - will replace the oneOfTheseStrings with authUser's locale if there is one
// - else, will replace the oneOfTheseStrings with the one if the cookie if it exists
// - else, will replce the oneOfTheseStrings with the first locale of the platfom (default)
export const locales = [
  'ar-MA',
  'ar-SA',
  'ca-ES',
  'cy-GB',
  'da',
  'da-DK',
  'de',
  'de-AT',
  'de-DE',
  'el-GR',
  'en',
  'en-CA',
  'en-GB',
  'en-IE',
  'es',
  'es-CL',
  'es-ES',
  'fi',
  'fi-FI',
  'fr',
  'fr-BE',
  'fr-FR',
  'hr-HR',
  'hu-HU',
  'it-IT',
  'kl-GL',
  'lt-LT',
  'lb-LU',
  'lv-LV',
  'mi',
  'nb',
  'nb-NO',
  'nl',
  'nl-BE',
  'nl-NL',
  'pa-IN',
  'pl-PL',
  'pt-BR',
  'ro-RO',
  'sr-Latn',
  'sr-SP',
  'sv-SE',
  'tr-TR',
  'ur-PK',
];

// the locales we really support, ie we have translations for these ect
export const appLocalePairs = {
  'ar-MA': 'عربي',
  'ar-SA': 'عربى',
  'ca-ES': 'Català',
  'cy-GB': 'Cymraeg',
  'da-DK': 'Dansk',
  'de-AT': 'Deutsch (Österreich)',
  'de-DE': 'Deutsch',
  'el-GR': 'Ελληνικά',
  en: 'English',
  'en-CA': 'English (Canada)',
  'en-GB': 'English (Great Britain)',
  'en-IE': 'English (Ireland)',
  'es-CL': 'Español (Chile)',
  'es-ES': 'Español (España)',
  'fi-FI': 'Suomi',
  'fr-BE': 'Français (Belgique)',
  'fr-FR': 'Français (France)',
  'hr-HR': 'Hrvatski',
  'hu-HU': 'Magyar',
  'it-IT': 'Italiano',
  'kl-GL': 'Kalaallisut',
  'lb-LU': 'Lëtzebuergesch',
  'lt-LT': 'Lietuvių',
  'lv-LV': 'Latviešu',
  mi: 'Māori',
  'nb-NO': 'Norsk (Bokmål)',
  'nl-BE': 'Nederlands (België)',
  'nl-NL': 'Nederlands (Nederland)',
  'pa-IN': 'ਪੰਜਾਬੀ (Gurmukhi)',
  'pl-PL': 'Polski',
  'pt-BR': 'Português (Brasil)',
  'ro-RO': 'Română',
  'sr-Latn': 'Srpski (Latinica)',
  'sr-SP': 'Српски (Ћирилица)',
  'sv-SE': 'Svenska',
  'tr-TR': 'Türkçe',
  'ur-PK': 'اردو (Urdu)',
};

export const appGraphqlLocalePairs = {
  arMa: 'ar-MA',
  arSa: 'ar',
  caEs: 'ca',
  cyGb: 'cy-GB',
  da: 'da',
  daDk: 'da-DK',
  de: 'de',
  deAt: 'de-AT',
  deDe: 'de-DE',
  elGr: 'el-GR',
  en: 'en',
  enCa: 'en-CA',
  enGb: 'en-GB',
  enIe: 'en-IE',
  es: 'es',
  esCl: 'es-CL',
  esEs: 'es-ES',
  fi: 'fi',
  fiFi: 'fi-FI',
  fr: 'fr',
  frBe: 'fr-BE',
  frFr: 'fr-FR',
  hrHr: 'hr-HR',
  huHu: 'hu-HU',
  itIt: 'it-IT',
  klGl: 'kl-GL',
  lbLu: 'lb-LU',
  ltLt: 'lt',
  lvLv: 'lv-LV',
  mi: 'mi',
  nb: 'nb',
  nbNo: 'nb-NO',
  nl: 'nl',
  nlBe: 'nl-BE',
  nlNl: 'nl-NL',
  paIn: 'pa-IN',
  plPl: 'pl-PL',
  ptBr: 'pt-BR',
  roRo: 'ro-RO',
  srLatn: 'sr-Latn',
  srSp: 'sr-SP',
  svSe: 'sv-SE',
  trTr: 'tr-TR',
  urPk: 'ur-PK',
};

export const shortenedAppLocalePairs = {
  'ar-MA': 'عربي',
  'ar-SA': 'عربى',
  'ca-ES': 'Català',
  'cy-GB': 'Cymraeg',
  'da-DK': 'Dansk',
  'de-AT': 'Deutsch',
  'de-DE': 'Deutsch',
  'el-GR': 'Ελληνικά',
  en: 'English',
  'en-CA': 'English',
  'en-GB': 'English',
  'en-IE': 'English',
  'es-CL': 'Español',
  'es-ES': 'Español',
  'fi-FI': 'Suomi',
  'fr-BE': 'Français',
  'fr-FR': 'Français',
  'hr-HR': 'Hrvatski',
  'hu-HU': 'Magyar',
  'it-IT': 'Italiano',
  'kl-GL': 'Kalaallisut',
  'lb-LU': 'Lëtzebuergesch',
  'lt-LT': 'Lietuvių',
  'lv-LV': 'Latviešu',
  mi: 'Māori',
  'nb-NO': 'Norsk',
  'nl-BE': 'Nederlands',
  'nl-NL': 'Nederlands',
  'pa-IN': 'ਪੰਜਾਬੀ',
  'pl-PL': 'Polski',
  'pt-BR': 'Português',
  'ro-RO': 'Română',
  'sr-Latn': 'Srpski',
  'sr-SP': 'Српски',
  'sv-SE': 'Svenska',
  'tr-TR': 'Türkçe',
  'ur-PK': 'اردو',
};

// https://github.com/moment/moment/tree/develop/locale lists the supported locales by moment.js
export const appLocalesMomentPairs = {
  'ar-MA': 'ar-ma',
  'ar-SA': 'ar-sa',
  'ca-ES': 'ca',
  'cy-GB': 'cy',
  'da-DK': 'da',
  'de-AT': 'de-at',
  'de-DE': 'de',
  'el-GR': 'el',
  'en-CA': 'en-ca',
  'en-GB': 'en-gb',
  'en-IE': 'en-ie',
  'es-CL': 'es',
  'es-ES': 'es',
  'fi-FI': 'fi',
  'fr-BE': 'fr',
  'fr-FR': 'fr',
  'hr-HR': 'hr',
  'hu-HU': 'hu',
  'it-IT': 'it',
  'kl-GL': 'da',
  'lb-LU': 'lb',
  'lt-LT': 'lt',
  'lv-LV': 'lv',
  mi: 'mi',
  'nb-NO': 'nb',
  'nl-BE': 'nl-be',
  'nl-NL': 'nl',
  'pa-IN': 'pa-in',
  'pl-PL': 'pl',
  'pt-BR': 'pt-br',
  'ro-RO': 'ro',
  'sr-Latn': 'sr',
  'sr-SP': 'sr',
  'sv-SE': 'sv',
  'tr-TR': 'tr',
  'ur-PK': 'ur',
};

/**
 * Dynamically imports the Moment.js locale file for the given locale name.
 *
 * This function uses `@ts-ignore` as a workaround for TypeScript's lack of built-in type definitions
 * for Moment.js locale files under 'moment/dist/locale/*'. By using dynamic imports, we avoid bundling
 * all locales at build time, reducing the application size and improving performance.
 *
 * Note:
 * - Vite has limitations with dynamic imports for files in node_modules. This implementation addresses
 *   those limitations by explicitly mapping locale names to their corresponding import paths.
 *
 * Reference:
 * - Vite issue: https://github.com/vitejs/vite/issues/14102
 *
 */
export async function localeGetter(localeName: string) {
  switch (localeName) {
    case 'ar-ma':
      // @ts-ignore
      await import('moment/dist/locale/ar-ma');
      break;
    case 'ar-sa':
      // @ts-ignore
      await import('moment/dist/locale/ar-sa');
      break;
    case 'ca':
      // @ts-ignore
      await import('moment/dist/locale/ca');
      break;
    case 'cy':
      // @ts-ignore
      await import('moment/dist/locale/cy');
      break;
    case 'da':
      // @ts-ignore
      await import('moment/dist/locale/da');
      break;
    case 'de':
      // @ts-ignore
      await import('moment/dist/locale/de');
      break;
    case 'de-at':
      // @ts-ignore
      await import('moment/dist/locale/de-at');
      break;
    case 'el':
      // @ts-ignore
      await import('moment/dist/locale/el');
      break;
    case 'en-ca':
      // @ts-ignore
      await import('moment/dist/locale/en-ca');
      break;
    case 'en-gb':
      // @ts-ignore
      await import('moment/dist/locale/en-gb');
      break;
    case 'en-ie':
      // @ts-ignore
      await import('moment/dist/locale/en-ie');
      break;
    case 'es':
      // @ts-ignore
      await import('moment/dist/locale/es');
      break;
    case 'fi':
      // @ts-ignore
      await import('moment/dist/locale/fi');
      break;
    case 'fr':
      // @ts-ignore
      await import('moment/dist/locale/fr');
      break;
    case 'hr':
      // @ts-ignore
      await import('moment/dist/locale/hr');
      break;
    case 'hu':
      // @ts-ignore
      await import('moment/dist/locale/hu');
      break;
    case 'it':
      // @ts-ignore
      await import('moment/dist/locale/it');
      break;
    case 'lb':
      // @ts-ignore
      await import('moment/dist/locale/lb');
      break;
    case 'lt':
      // @ts-ignore
      await import('moment/dist/locale/lt');
      break;
    case 'lv':
      // @ts-ignore
      await import('moment/dist/locale/lv');
      break;
    case 'mi':
      // @ts-ignore
      await import('moment/dist/locale/mi');
      break;
    case 'nb':
      // @ts-ignore
      await import('moment/dist/locale/nb');
      break;
    case 'nl-be':
      // @ts-ignore
      await import('moment/dist/locale/nl-be');
      break;
    case 'nl':
      // @ts-ignore
      await import('moment/dist/locale/nl');
      break;
    case 'pa-in':
      // @ts-ignore
      await import('moment/dist/locale/pa-in');
      break;
    case 'pl':
      // @ts-ignore
      await import('moment/dist/locale/pl');
      break;
    case 'pt-br':
      // @ts-ignore
      await import('moment/dist/locale/pt-br');
      break;
    case 'ro':
      // @ts-ignore
      await import('moment/dist/locale/ro');
      break;
    case 'sr':
    case 'sr-Latn':
      // @ts-ignore
      await import('moment/dist/locale/sr');
      break;
    case 'sr-SP':
      // @ts-ignore
      await import('moment/dist/locale/sr-cyrl');
      break;
    case 'sv':
      // @ts-ignore
      await import('moment/dist/locale/sv');
      break;
    case 'tr':
      // @ts-ignore
      await import('moment/dist/locale/tr');
      break;
    case 'ur':
      // @ts-ignore
      await import('moment/dist/locale/ur');
      break;
    default:
      console.warn(`No matching locale import for: ${localeName}`);
      break;
  }
}
