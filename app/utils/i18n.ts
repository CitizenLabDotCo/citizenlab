import { Multiloc, Locale } from 'typings';
import keys from 'lodash/keys';
import { isNilOrError } from 'utils/helperUtils';
import { truncate } from 'utils/textUtils';

export function getLocalized(
  multiloc: Multiloc | null | undefined,
  locale: Locale,
  currentTenantLocales: Locale[],
  maxLength?: number,
): string {
  if (isNilOrError(multiloc) || isNilOrError(locale) || isNilOrError(currentTenantLocales)) {
    return '';
  }

  const candidateLocales = [locale, ...currentTenantLocales, ...(keys(multiloc) || [])];
  const winnerLocale = candidateLocales.find(locale => !!multiloc[locale]);

  const winner = (winnerLocale ? multiloc[winnerLocale] : '');
  return truncate(winner, maxLength);
}
