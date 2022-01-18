import { parse } from 'qs';
import { isNil } from 'lodash-es';

export type SortDirection = 'ascending' | 'descending';

export function getPageNumberFromUrl(url) {
  if (!url || typeof url !== 'string' || url === '') return null;
  const queryString = url.split('?')[1];
  const result = parse(queryString).page?.['number'];
  return isNil(result) || result < 0 ? null : parseInt(result, 10);
}

export function getSortAttribute<Sort, SortAttribute>(sort: Sort) {
  return (sort as any).replace(/^-/, '') as SortAttribute;
}

export function getSortDirection<Sort>(sort: Sort): SortDirection {
  return (sort as any).startsWith('-') ? 'descending' : 'ascending';
}
