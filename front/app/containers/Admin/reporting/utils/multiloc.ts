import { keys } from 'utils/helperUtils';
import { Multiloc, Locale } from 'typings';

export const formatMultiloc = (
  multiloc: Multiloc,
  format: (value: string | undefined, locale: Locale) => string
): Multiloc => {
  return keys(multiloc).reduce((acc, locale) => {
    return {
      ...acc,
      [locale]: format(multiloc[locale], locale),
    };
  }, {});
};

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
