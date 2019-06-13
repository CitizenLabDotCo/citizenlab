export const AUTH_PATH = '/auth';
export const API_PATH = '/web_api/v1';
export const GOOGLE_MAPS_API_KEY = 'AIzaSyDRtFe1KRBnGfDy_ijw6yCYsYnEkQRl9Cw';
export const CL_GA_TRACKING_ID = 'UA-65562281-44';
export const CL_GA_TRACKER_NAME = 'CitizenLab2';
export const CL_SEGMENT_API_KEY = process.env.SEGMENT_API_KEY || 'sIoYsVoTTCBmrcs7yAz1zRFRGhAofBlg';
export const API_HOST = process.env.API_HOST || (typeof window === 'undefined' ? 'localhost' : window.location.hostname);
export const API_PORT = process.env.API_PORT || 4000;
export const DEFAULT_LOCALE = 'en';

// the locales we "support" :
// platformBaseUrl/{oneOfTheseStrings}/{anything we have a route for}
// - won't 404
// - will replace the oneOfTheseStrings with authUser's locale if there is one
// - else, will replace the oneOfTheseStrings with the one if the cookie if it exists
// - else, will replce the oneOfTheseStrings with the first locale of the platfom (default)
export const locales = [
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
  'es-CL'
];

// the locales we really support, ie we have translations for these ect
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
  'es-ES': 'Español (España)',
  'es-CL': 'Español (Chile)',
  ach: 'Acholi',
};

export const shortenedAppLocalePairs = {
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
  ach: 'Acholi',
};

export const appLocalesMomentPairs = {
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
};
