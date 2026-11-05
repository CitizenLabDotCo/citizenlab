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

// Rich text editors leave markup such as "<p><br></p>" in an empty field.
export const hasContent = (value: string | undefined): boolean =>
  !!value &&
  (value.replace(/<[^>]*>/g, '').trim().length > 0 ||
    /<(img|iframe)\b/.test(value));
