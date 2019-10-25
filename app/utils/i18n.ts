import { Multiloc, Locale, GraphqlLocale } from 'typings';
import { keys } from 'lodash-es';
import { isNilOrError } from 'utils/helperUtils';
import { truncate } from 'utils/textUtils';

export function getLocalized(
  multiloc: Multiloc | null | undefined,
  locale: Locale | GraphqlLocale | null | undefined | Error,
  tenantLocales: Locale[] | GraphqlLocale[] | null | undefined | Error,
  maxLength?: number,
) {
  if (isNilOrError(multiloc) || isNilOrError(locale) || isNilOrError(tenantLocales)) {
    return '';
  }

  const candidateLocales = [locale, ...tenantLocales, ...(keys(multiloc) || [])];
  const winnerLocale = candidateLocales.find(locale => !locale.startsWith('__') && !!multiloc[locale]);
  const winner = (winnerLocale ? multiloc[winnerLocale] : '');

  return truncate(winner, maxLength);
}
