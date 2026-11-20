import { SupportedLocale } from 'typings';

// The name of the locale's language, written in the display locale (e.g. "Dutch (Belgium)").
export const getLocaleDisplayName = (
  locale: SupportedLocale,
  displayLocale: SupportedLocale
): string => {
  try {
    return (
      new Intl.DisplayNames([displayLocale], { type: 'language' }).of(locale) ??
      locale
    );
  } catch {
    return locale;
  }
};

// The name of the locale's language without the region (e.g. "Dutch" for nl-BE), written
// in the display locale.
export const getLanguageName = (
  locale: SupportedLocale,
  displayLocale: SupportedLocale
): string =>
  getLocaleDisplayName(locale.split('-')[0] as SupportedLocale, displayLocale);

// Rich text editors leave markup such as "<p><br></p>" in an empty field.
export const hasContent = (value: string | undefined): boolean =>
  !!value &&
  (value.replace(/<[^>]*>/g, '').trim().length > 0 ||
    /<(img|iframe)\b/.test(value));

// The visible text only, so that small markup changes of an editor do not count as an edit.
export const normalizeText = (value: string | undefined): string =>
  (value ?? '')
    .replace(/<[^>]*>/g, ' ')
    .replace(/&nbsp;/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
