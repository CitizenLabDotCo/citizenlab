import { isNil } from 'lodash-es';
import { parse } from 'qs';

export type SortDirection = 'ascending' | 'descending';

export function getPageNumberFromUrl(url: string) {
  if (url === '') return null;
  const queryString = url.split('?')[1];
  const result = parse(queryString).page?.['number'];
  return isNil(result) || result < 0 ? null : parseInt(result, 10);
}

export function getSortAttribute<Sort, SortAttribute>(sort: Sort) {
  return (sort as any).replace(/^-/, '') as SortAttribute;
}

export function getSortDirection<Sort>(sort: Sort): SortDirection {
  return (sort as any).startsWith('-') ? 'ascending' : 'descending';
}
