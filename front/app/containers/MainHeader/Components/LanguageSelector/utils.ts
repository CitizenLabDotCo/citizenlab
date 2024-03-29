import { CLLocale } from 'typings';

export const getSelectedLocale = (locale: CLLocale) => {
  if (locale === 'sr-SP') {
    return 'CP';
  } else {
    return locale.substr(0, 2).toUpperCase();
  }
};
