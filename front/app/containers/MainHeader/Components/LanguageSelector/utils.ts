import { Locale } from 'typings';

export const getSelectedLocale = (locale: Locale) => {
  if (locale === 'sr-SP') {
    return 'CP';
  } else {
    return locale.substr(0, 2).toUpperCase();
  }
};
