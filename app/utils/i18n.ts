import { Multiloc, Locale } from 'typings';
import { Map } from 'immutable';
import * as _ from 'lodash';

function isImmutable(multiloc: Multiloc | Map<String, String> | null): multiloc is Map<String, String> {
  return typeof (<Map<string, string>>multiloc).toJS !== 'undefined';
}

export function getLocalized(multiloc: Multiloc | Map<String, String> | null, locale: Locale, currentTenantLocales: Locale[]) : string {
  let multilocObject : Multiloc = {};
  if (!multiloc) {
    return '';
  }
  if (isImmutable(multiloc)) {
    multilocObject = multiloc.toJS() as Multiloc;
  } else {
    multilocObject = multiloc;
  }
  const candidateLocales: string[] = [locale, ...currentTenantLocales, ...(_.keys(multilocObject) || [])];
  const winnerLocale = candidateLocales.find((locale) => !!multilocObject[locale]);
  return (winnerLocale && multilocObject[winnerLocale]) || '';
}
