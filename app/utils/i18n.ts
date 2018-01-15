import { Multiloc } from 'typings';
import { Map } from 'immutable';
import { keys } from 'lodash';

function isImmutable(multiloc: Multiloc | Map<String, String> | null): multiloc is Map<String, String> {
  return typeof (<Multiloc>multiloc).toJS !== 'undefined';
}

export function getLocalized(multiloc: Multiloc | Map<String, String> | null | undefined, locale: string, currentTenantLocales: string[]) : string {
  let multilocObject : Multiloc = {};
  if (!multiloc) {
    return '';
  }
  if (isImmutable(multiloc)) {
    multilocObject = multiloc.toJS() as Multiloc;
  } else {
    multilocObject = multiloc;
  }
  const candidateLocales: string[] = [locale, ...currentTenantLocales, ...(keys(multilocObject) || [])];
  const winnerLocale = candidateLocales.find((locale) => !!multilocObject[locale]);
  return (winnerLocale && multilocObject[winnerLocale]) || '';
}
