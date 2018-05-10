import { Multiloc, Locale } from 'typings';
import keys from 'lodash/keys';
import { isNilOrError } from 'utils/helperUtils';

export function getLocalized(
  multiloc: Multiloc | null | undefined, 
  locale: Locale,
  currentTenantLocales: Locale[]
): string {
  if (isNilOrError(multiloc) || isNilOrError(locale) || isNilOrError(currentTenantLocales)) {
    return '';
  }

  const candidateLocales = [locale, ...currentTenantLocales, ...(keys(multiloc) || [])];
  const winnerLocale = candidateLocales.find(locale => !!multiloc[locale]);

  return (winnerLocale ? multiloc[winnerLocale] : '');
}
