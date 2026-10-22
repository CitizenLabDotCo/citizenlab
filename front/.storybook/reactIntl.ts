import en from '../app/translations/en.json';
import enAdmin from '../app/translations/admin/en.json';
import deAT from '../app/translations/de-AT.json';
import deATAdmin from '../app/translations/admin/de-AT.json';
import nlBE from '../app/translations/nl-BE.json';
import nlBEAdmin from '../app/translations/admin/nl-BE.json';
import frBE from '../app/translations/fr-BE.json';
import frBEAdmin from '../app/translations/admin/fr-BE.json';

// Platform and admin messages per locale, like app/i18n/<locale>.ts does.
// Picked from the "Language" toolbar menu.
const messages = {
  en: { ...en, ...enAdmin },
  'de-AT': { ...deAT, ...deATAdmin },
  'nl-BE': { ...nlBE, ...nlBEAdmin },
  'fr-BE': { ...frBE, ...frBEAdmin },
};

export type StorybookLocale = keyof typeof messages;

export const locales = Object.keys(messages) as StorybookLocale[];

const formats = {}; // optional, if you have any formats

export const reactIntl = {
  defaultLocale: 'en',
  locales,
  messages,
  formats,
};
