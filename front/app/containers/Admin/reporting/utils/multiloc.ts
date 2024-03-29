import { Multiloc, CLLocale } from 'typings';

export const createMultiloc = (
  locales: CLLocale[],
  getValue: (locale: CLLocale) => string
): Multiloc => {
  return locales.reduce((acc, locale) => {
    return {
      ...acc,
      [locale]: getValue(locale),
    };
  }, {});
};
