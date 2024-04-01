import { SupportedLocale } from 'typings';

export const getSelectedLocale = (locale: SupportedLocale) => {
  if (locale === 'sr-SP') {
    return 'CP';
  } else {
    return locale.substr(0, 2).toUpperCase();
  }
};
