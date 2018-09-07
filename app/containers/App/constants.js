"use strict";
exports.__esModule = true;
exports.AUTH_PATH = '/auth';
exports.API_PATH = '/web_api/v1';
exports.GOOGLE_MAPS_API_KEY = 'AIzaSyDRtFe1KRBnGfDy_ijw6yCYsYnEkQRl9Cw';
exports.CL_GA_TRACKING_ID = 'UA-65562281-44';
exports.CL_GA_TRACKER_NAME = 'CitizenLab2';
exports.CL_SEGMENT_API_KEY = process.env.SEGMENT_API_KEY || 'sIoYsVoTTCBmrcs7yAz1zRFRGhAofBlg';
exports.API_HOST = process.env.API_HOST || (typeof window === 'undefined' ? 'localhost' : window.location.hostname);
exports.API_PORT = process.env.API_PORT || 4000;
exports.DEFAULT_LOCALE = 'en';
exports.locales = [
    'en',
    'fr',
    'de',
    'nl',
    'nb',
    'nb',
    'da',
    'de-DE',
    'en-GB',
    'en-CA',
    'fr-BE',
    'fr-FR',
    'nl-BE',
    'nl-NL',
    'da-DK',
    'nb-NO'
];
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
    ach: 'Acholi'
};
