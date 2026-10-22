import en from '../app/translations/en.json';
import enAdmin from '../app/translations/admin/en.json';
import de from '../app/translations/de-DE.json';
import deAdmin from '../app/translations/admin/de-DE.json';
import es from '../app/translations/es-ES.json';
import esAdmin from '../app/translations/admin/es-ES.json';
import da from '../app/translations/da-DK.json';
import daAdmin from '../app/translations/admin/da-DK.json';
import nlBE from '../app/translations/nl-BE.json';
import nlBEAdmin from '../app/translations/admin/nl-BE.json';
import frBE from '../app/translations/fr-BE.json';
import frBEAdmin from '../app/translations/admin/fr-BE.json';
import ar from '../app/translations/ar-SA.json';
import arAdmin from '../app/translations/admin/ar-SA.json';

import { LANGUAGES, Language } from './languages';

// Platform and admin messages per language of ./languages, like
// app/i18n/<locale>.ts does. Picked from the "Language" toolbar menu.
// de, es, da and ar use the de-DE, es-ES, da-DK and ar-SA messages.
const messages: Record<Language, Record<string, string>> = {
  en: { ...en, ...enAdmin },
  'nl-BE': { ...nlBE, ...nlBEAdmin },
  'fr-BE': { ...frBE, ...frBEAdmin },
  de: { ...de, ...deAdmin },
  es: { ...es, ...esAdmin },
  da: { ...da, ...daAdmin },
  // Right-to-left check: setting this language also turns on theme.isRtl,
  // like App/index.tsx does.
  ar: { ...ar, ...arAdmin },
};

export type StorybookLocale = Language;

export const locales = LANGUAGES.map((l) => l.value);

const formats = {}; // optional, if you have any formats

export const reactIntl = {
  defaultLocale: 'en',
  locales,
  messages,
  formats,
};
