import { Multiloc, Locale } from 'typings';

export const createMultiloc = (
  locales: Locale[],
  getValue: (locale: Locale) => string
): Multiloc => {
  return locales.reduce((acc, locale) => {
    return {
      ...acc,
      [locale]: getValue(locale),
    };
  }, {});
};
