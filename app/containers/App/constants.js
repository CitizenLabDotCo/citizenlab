"use strict";
exports.__esModule = true;
exports.AUTH_PATH = '/auth';
exports.API_PATH = '/web_api/v1';
exports.ADMIN_TEMPLATES_GRAPHQL_PATH = '/admin_templates_api/graphql';
exports.GOOGLE_MAPS_API_KEY = '***REMOVED***';
exports.CL_GA_TRACKING_ID = 'UA-65562281-44';
exports.CL_GA_TRACKER_NAME = 'CitizenLab2';
exports.CL_SEGMENT_API_KEY = process.env.SEGMENT_API_KEY || 'sIoYsVoTTCBmrcs7yAz1zRFRGhAofBlg';
exports.API_HOST = process.env.API_HOST || (typeof window === 'undefined' ? 'localhost' : window.location.hostname);
exports.API_PORT = process.env.API_PORT || 4000;
exports.GRAPHQL_HOST = process.env.GRAPHQL_HOST || (typeof window === 'undefined' ? 'localhost' : window.location.hostname);
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
    'es-CL'
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
    ach: 'Acholi'
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
    ach: 'Acholi'
};
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
    'es-CL': 'es'
};
