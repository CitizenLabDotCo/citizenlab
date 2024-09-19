import { Locale } from 'date-fns';
import { SupportedLocale } from 'typings';

const LOCALES = {};

export const addLocale = (localeName: SupportedLocale, localeData: Locale) => {
  LOCALES[localeName] = localeData;
};

export const getLocale = (localeName: SupportedLocale) => {
  return LOCALES[localeName];
};
