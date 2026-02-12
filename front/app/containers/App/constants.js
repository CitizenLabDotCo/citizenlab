'use strict';
var __awaiter =
  (this && this.__awaiter) ||
  function (thisArg, _arguments, P, generator) {
    function adopt(value) {
      return value instanceof P
        ? value
        : new P(function (resolve) {
            resolve(value);
          });
    }
    return new (P || (P = Promise))(function (resolve, reject) {
      function fulfilled(value) {
        try {
          step(generator.next(value));
        } catch (e) {
          reject(e);
        }
      }
      function rejected(value) {
        try {
          step(generator['throw'](value));
        } catch (e) {
          reject(e);
        }
      }
      function step(result) {
        result.done
          ? resolve(result.value)
          : adopt(result.value).then(fulfilled, rejected);
      }
      step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
  };
var __generator =
  (this && this.__generator) ||
  function (thisArg, body) {
    var _ = {
        label: 0,
        sent: function () {
          if (t[0] & 1) throw t[1];
          return t[1];
        },
        trys: [],
        ops: [],
      },
      f,
      y,
      t,
      g;
    return (
      (g = { next: verb(0), throw: verb(1), return: verb(2) }),
      typeof Symbol === 'function' &&
        (g[Symbol.iterator] = function () {
          return this;
        }),
      g
    );
    function verb(n) {
      return function (v) {
        return step([n, v]);
      };
    }
    function step(op) {
      if (f) throw new TypeError('Generator is already executing.');
      while ((g && ((g = 0), op[0] && (_ = 0)), _))
        try {
          if (
            ((f = 1),
            y &&
              (t =
                op[0] & 2
                  ? y['return']
                  : op[0]
                  ? y['throw'] || ((t = y['return']) && t.call(y), 0)
                  : y.next) &&
              !(t = t.call(y, op[1])).done)
          )
            return t;
          if (((y = 0), t)) op = [op[0] & 2, t.value];
          switch (op[0]) {
            case 0:
            case 1:
              t = op;
              break;
            case 4:
              _.label++;
              return { value: op[1], done: false };
            case 5:
              _.label++;
              y = op[1];
              op = [0];
              continue;
            case 7:
              op = _.ops.pop();
              _.trys.pop();
              continue;
            default:
              if (
                !((t = _.trys), (t = t.length > 0 && t[t.length - 1])) &&
                (op[0] === 6 || op[0] === 2)
              ) {
                _ = 0;
                continue;
              }
              if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) {
                _.label = op[1];
                break;
              }
              if (op[0] === 6 && _.label < t[1]) {
                _.label = t[1];
                t = op;
                break;
              }
              if (t && _.label < t[2]) {
                _.label = t[2];
                _.ops.push(op);
                break;
              }
              if (t[2]) _.ops.pop();
              _.trys.pop();
              continue;
          }
          op = body.call(thisArg, _);
        } catch (e) {
          op = [6, e];
          y = 0;
        } finally {
          f = t = 0;
        }
      if (op[0] & 5) throw op[1];
      return { value: op[0] ? op[1] : void 0, done: true };
    }
  };
Object.defineProperty(exports, '__esModule', { value: true });
exports.localeGetter =
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
  exports.API_PATH =
  exports.AUTH_PATH =
    void 0;
exports.AUTH_PATH = '/auth';
exports.API_PATH = '/web_api/v1';
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
  'cy-GB',
  'da',
  'da-DK',
  'de',
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
exports.appLocalePairs = {
  'ar-MA': 'عربي',
  'ar-SA': 'عربى',
  'ca-ES': 'Català',
  'cy-GB': 'Cymraeg',
  'da-DK': 'Dansk',
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
exports.appGraphqlLocalePairs = {
  arMa: 'ar-MA',
  arSa: 'ar',
  caEs: 'ca',
  cyGb: 'cy-GB',
  da: 'da',
  daDk: 'da-DK',
  de: 'de',
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
exports.shortenedAppLocalePairs = {
  'ar-MA': 'عربي',
  'ar-SA': 'عربى',
  'ca-ES': 'Català',
  'cy-GB': 'Cymraeg',
  'da-DK': 'Dansk',
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
exports.appLocalesMomentPairs = {
  'ar-MA': 'ar-ma',
  'ar-SA': 'ar-sa',
  'ca-ES': 'ca',
  'cy-GB': 'cy',
  'da-DK': 'da',
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
function localeGetter(localeName) {
  return __awaiter(this, void 0, void 0, function () {
    var _a;
    return __generator(this, function (_b) {
      switch (_b.label) {
        case 0:
          _a = localeName;
          switch (_a) {
            case 'ar-ma':
              return [3 /*break*/, 1];
            case 'ar-sa':
              return [3 /*break*/, 3];
            case 'ca':
              return [3 /*break*/, 5];
            case 'cy':
              return [3 /*break*/, 7];
            case 'da':
              return [3 /*break*/, 9];
            case 'de':
              return [3 /*break*/, 11];
            case 'el':
              return [3 /*break*/, 13];
            case 'en-ca':
              return [3 /*break*/, 15];
            case 'en-gb':
              return [3 /*break*/, 17];
            case 'en-ie':
              return [3 /*break*/, 19];
            case 'es':
              return [3 /*break*/, 21];
            case 'fi':
              return [3 /*break*/, 23];
            case 'fr':
              return [3 /*break*/, 25];
            case 'hr':
              return [3 /*break*/, 27];
            case 'hu':
              return [3 /*break*/, 29];
            case 'it':
              return [3 /*break*/, 31];
            case 'lb':
              return [3 /*break*/, 33];
            case 'lt':
              return [3 /*break*/, 35];
            case 'lv':
              return [3 /*break*/, 37];
            case 'mi':
              return [3 /*break*/, 39];
            case 'nb':
              return [3 /*break*/, 41];
            case 'nl-be':
              return [3 /*break*/, 43];
            case 'nl':
              return [3 /*break*/, 45];
            case 'pa-in':
              return [3 /*break*/, 47];
            case 'pl':
              return [3 /*break*/, 49];
            case 'pt-br':
              return [3 /*break*/, 51];
            case 'ro':
              return [3 /*break*/, 53];
            case 'sr':
              return [3 /*break*/, 55];
            case 'sr-Latn':
              return [3 /*break*/, 55];
            case 'sr-SP':
              return [3 /*break*/, 57];
            case 'sv':
              return [3 /*break*/, 59];
            case 'tr':
              return [3 /*break*/, 61];
            case 'ur':
              return [3 /*break*/, 63];
          }
          return [3 /*break*/, 65];
        case 1:
          // @ts-ignore
          return [
            4 /*yield*/,
            Promise.resolve().then(function () {
              return require('moment/dist/locale/ar-ma');
            }),
          ];
        case 2:
          // @ts-ignore
          _b.sent();
          return [3 /*break*/, 66];
        case 3:
          // @ts-ignore
          return [
            4 /*yield*/,
            Promise.resolve().then(function () {
              return require('moment/dist/locale/ar-sa');
            }),
          ];
        case 4:
          // @ts-ignore
          _b.sent();
          return [3 /*break*/, 66];
        case 5:
          // @ts-ignore
          return [
            4 /*yield*/,
            Promise.resolve().then(function () {
              return require('moment/dist/locale/ca');
            }),
          ];
        case 6:
          // @ts-ignore
          _b.sent();
          return [3 /*break*/, 66];
        case 7:
          // @ts-ignore
          return [
            4 /*yield*/,
            Promise.resolve().then(function () {
              return require('moment/dist/locale/cy');
            }),
          ];
        case 8:
          // @ts-ignore
          _b.sent();
          return [3 /*break*/, 66];
        case 9:
          // @ts-ignore
          return [
            4 /*yield*/,
            Promise.resolve().then(function () {
              return require('moment/dist/locale/da');
            }),
          ];
        case 10:
          // @ts-ignore
          _b.sent();
          return [3 /*break*/, 66];
        case 11:
          // @ts-ignore
          return [
            4 /*yield*/,
            Promise.resolve().then(function () {
              return require('moment/dist/locale/de');
            }),
          ];
        case 12:
          // @ts-ignore
          _b.sent();
          return [3 /*break*/, 66];
        case 13:
          // @ts-ignore
          return [
            4 /*yield*/,
            Promise.resolve().then(function () {
              return require('moment/dist/locale/el');
            }),
          ];
        case 14:
          // @ts-ignore
          _b.sent();
          return [3 /*break*/, 66];
        case 15:
          // @ts-ignore
          return [
            4 /*yield*/,
            Promise.resolve().then(function () {
              return require('moment/dist/locale/en-ca');
            }),
          ];
        case 16:
          // @ts-ignore
          _b.sent();
          return [3 /*break*/, 66];
        case 17:
          // @ts-ignore
          return [
            4 /*yield*/,
            Promise.resolve().then(function () {
              return require('moment/dist/locale/en-gb');
            }),
          ];
        case 18:
          // @ts-ignore
          _b.sent();
          return [3 /*break*/, 66];
        case 19:
          // @ts-ignore
          return [
            4 /*yield*/,
            Promise.resolve().then(function () {
              return require('moment/dist/locale/en-ie');
            }),
          ];
        case 20:
          // @ts-ignore
          _b.sent();
          return [3 /*break*/, 66];
        case 21:
          // @ts-ignore
          return [
            4 /*yield*/,
            Promise.resolve().then(function () {
              return require('moment/dist/locale/es');
            }),
          ];
        case 22:
          // @ts-ignore
          _b.sent();
          return [3 /*break*/, 66];
        case 23:
          // @ts-ignore
          return [
            4 /*yield*/,
            Promise.resolve().then(function () {
              return require('moment/dist/locale/fi');
            }),
          ];
        case 24:
          // @ts-ignore
          _b.sent();
          return [3 /*break*/, 66];
        case 25:
          // @ts-ignore
          return [
            4 /*yield*/,
            Promise.resolve().then(function () {
              return require('moment/dist/locale/fr');
            }),
          ];
        case 26:
          // @ts-ignore
          _b.sent();
          return [3 /*break*/, 66];
        case 27:
          // @ts-ignore
          return [
            4 /*yield*/,
            Promise.resolve().then(function () {
              return require('moment/dist/locale/hr');
            }),
          ];
        case 28:
          // @ts-ignore
          _b.sent();
          return [3 /*break*/, 66];
        case 29:
          // @ts-ignore
          return [
            4 /*yield*/,
            Promise.resolve().then(function () {
              return require('moment/dist/locale/hu');
            }),
          ];
        case 30:
          // @ts-ignore
          _b.sent();
          return [3 /*break*/, 66];
        case 31:
          // @ts-ignore
          return [
            4 /*yield*/,
            Promise.resolve().then(function () {
              return require('moment/dist/locale/it');
            }),
          ];
        case 32:
          // @ts-ignore
          _b.sent();
          return [3 /*break*/, 66];
        case 33:
          // @ts-ignore
          return [
            4 /*yield*/,
            Promise.resolve().then(function () {
              return require('moment/dist/locale/lb');
            }),
          ];
        case 34:
          // @ts-ignore
          _b.sent();
          return [3 /*break*/, 66];
        case 35:
          // @ts-ignore
          return [
            4 /*yield*/,
            Promise.resolve().then(function () {
              return require('moment/dist/locale/lt');
            }),
          ];
        case 36:
          // @ts-ignore
          _b.sent();
          return [3 /*break*/, 66];
        case 37:
          // @ts-ignore
          return [
            4 /*yield*/,
            Promise.resolve().then(function () {
              return require('moment/dist/locale/lv');
            }),
          ];
        case 38:
          // @ts-ignore
          _b.sent();
          return [3 /*break*/, 66];
        case 39:
          // @ts-ignore
          return [
            4 /*yield*/,
            Promise.resolve().then(function () {
              return require('moment/dist/locale/mi');
            }),
          ];
        case 40:
          // @ts-ignore
          _b.sent();
          return [3 /*break*/, 66];
        case 41:
          // @ts-ignore
          return [
            4 /*yield*/,
            Promise.resolve().then(function () {
              return require('moment/dist/locale/nb');
            }),
          ];
        case 42:
          // @ts-ignore
          _b.sent();
          return [3 /*break*/, 66];
        case 43:
          // @ts-ignore
          return [
            4 /*yield*/,
            Promise.resolve().then(function () {
              return require('moment/dist/locale/nl-be');
            }),
          ];
        case 44:
          // @ts-ignore
          _b.sent();
          return [3 /*break*/, 66];
        case 45:
          // @ts-ignore
          return [
            4 /*yield*/,
            Promise.resolve().then(function () {
              return require('moment/dist/locale/nl');
            }),
          ];
        case 46:
          // @ts-ignore
          _b.sent();
          return [3 /*break*/, 66];
        case 47:
          // @ts-ignore
          return [
            4 /*yield*/,
            Promise.resolve().then(function () {
              return require('moment/dist/locale/pa-in');
            }),
          ];
        case 48:
          // @ts-ignore
          _b.sent();
          return [3 /*break*/, 66];
        case 49:
          // @ts-ignore
          return [
            4 /*yield*/,
            Promise.resolve().then(function () {
              return require('moment/dist/locale/pl');
            }),
          ];
        case 50:
          // @ts-ignore
          _b.sent();
          return [3 /*break*/, 66];
        case 51:
          // @ts-ignore
          return [
            4 /*yield*/,
            Promise.resolve().then(function () {
              return require('moment/dist/locale/pt-br');
            }),
          ];
        case 52:
          // @ts-ignore
          _b.sent();
          return [3 /*break*/, 66];
        case 53:
          // @ts-ignore
          return [
            4 /*yield*/,
            Promise.resolve().then(function () {
              return require('moment/dist/locale/ro');
            }),
          ];
        case 54:
          // @ts-ignore
          _b.sent();
          return [3 /*break*/, 66];
        case 55:
          // @ts-ignore
          return [
            4 /*yield*/,
            Promise.resolve().then(function () {
              return require('moment/dist/locale/sr');
            }),
          ];
        case 56:
          // @ts-ignore
          _b.sent();
          return [3 /*break*/, 66];
        case 57:
          // @ts-ignore
          return [
            4 /*yield*/,
            Promise.resolve().then(function () {
              return require('moment/dist/locale/sr-cyrl');
            }),
          ];
        case 58:
          // @ts-ignore
          _b.sent();
          return [3 /*break*/, 66];
        case 59:
          // @ts-ignore
          return [
            4 /*yield*/,
            Promise.resolve().then(function () {
              return require('moment/dist/locale/sv');
            }),
          ];
        case 60:
          // @ts-ignore
          _b.sent();
          return [3 /*break*/, 66];
        case 61:
          // @ts-ignore
          return [
            4 /*yield*/,
            Promise.resolve().then(function () {
              return require('moment/dist/locale/tr');
            }),
          ];
        case 62:
          // @ts-ignore
          _b.sent();
          return [3 /*break*/, 66];
        case 63:
          // @ts-ignore
          return [
            4 /*yield*/,
            Promise.resolve().then(function () {
              return require('moment/dist/locale/ur');
            }),
          ];
        case 64:
          // @ts-ignore
          _b.sent();
          return [3 /*break*/, 66];
        case 65:
          console.warn('No matching locale import for: '.concat(localeName));
          return [3 /*break*/, 66];
        case 66:
          return [2 /*return*/];
      }
    });
  });
}
exports.localeGetter = localeGetter;
