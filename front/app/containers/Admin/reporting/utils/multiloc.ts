import { Multiloc, SupportedLocale } from 'typings';

export const createMultiloc = (
  locales: SupportedLocale[],
  getValue: (locale: SupportedLocale) => string
): Multiloc => {
  return locales.reduce((acc, locale) => {
    return {
      ...acc,
      [locale]: getValue(locale),
    };
  }, {});
};
