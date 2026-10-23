import { LANGUAGES, Language } from './languages';

type Messages = Record<string, string>;
type MessageModule = { default: Messages };

// Platform and admin messages per language of ./languages, like
// app/i18n/<locale>.ts does. Picked from the "Language" toolbar menu.
// de, es, da and ar use the de-DE, es-ES, da-DK and ar-SA messages.
// Each language is its own chunk, fetched when a story first needs it: all
// of them together are about 5.7 MB of the preview bundle otherwise.
const messageFiles: Record<
  Language,
  () => Promise<[MessageModule, MessageModule]>
> = {
  en: () =>
    Promise.all([
      import('../app/translations/en.json'),
      import('../app/translations/admin/en.json'),
    ]),
  'nl-BE': () =>
    Promise.all([
      import('../app/translations/nl-BE.json'),
      import('../app/translations/admin/nl-BE.json'),
    ]),
  'fr-BE': () =>
    Promise.all([
      import('../app/translations/fr-BE.json'),
      import('../app/translations/admin/fr-BE.json'),
    ]),
  de: () =>
    Promise.all([
      import('../app/translations/de-DE.json'),
      import('../app/translations/admin/de-DE.json'),
    ]),
  es: () =>
    Promise.all([
      import('../app/translations/es-ES.json'),
      import('../app/translations/admin/es-ES.json'),
    ]),
  da: () =>
    Promise.all([
      import('../app/translations/da-DK.json'),
      import('../app/translations/admin/da-DK.json'),
    ]),
  // Right-to-left check: setting this language also turns on theme.isRtl,
  // like App/index.tsx does.
  ar: () =>
    Promise.all([
      import('../app/translations/ar-SA.json'),
      import('../app/translations/admin/ar-SA.json'),
    ]),
};

export type StorybookLocale = Language;

export const locales = LANGUAGES.map((l) => l.value);

const defaultLocale = 'en';

const loading: Partial<Record<Language, Promise<Messages>>> = {};

// Resolves the messages of a language, fetching its files once. A value
// that is not a language of the menu has no messages, as before.
export const loadMessages = async (
  locale: string
): Promise<Messages | undefined> => {
  if (!Object.prototype.hasOwnProperty.call(messageFiles, locale)) {
    return undefined;
  }
  const lang = locale as StorybookLocale;
  loading[lang] ??= messageFiles[lang]().then(([platform, admin]) => ({
    ...platform.default,
    ...admin.default,
  }));
  return loading[lang];
};

// Starts fetching the language of the frame URL (or the default) right
// away, so it downloads while the preview boots instead of after.
loadMessages(
  /(?:^|;)lang:([^;]+)/.exec(
    new URLSearchParams(window.location.search).get('globals') ?? ''
  )?.[1] ?? defaultLocale
);

const formats = {}; // optional, if you have any formats

export const reactIntl = {
  defaultLocale,
  locales,
  formats,
};
