import * as qs from 'qs';

export type SortDirection = 'ascending' | 'descending';

export function getPageNumberFromUrl(url) {
  if (!url) return null;
  const queryString = url.split('?')[1];
  const result = qs.parse(queryString).page.number;
  return (result < 0 ? null : parseInt(result, 10));
}

export function getPageItemCountFromUrl(url) {
  if (!url) return null;
  const queryString = url.split('?')[1];
  const result = qs.parse(queryString).page.size;
  return (result < 0 ? null : parseInt(result, 10));
}

export function getSortAttribute<Sort, SortAttribute>(sort: Sort) {
  return (sort as any).replace(/^-/, '') as SortAttribute;
}

export function getSortDirection<Sort>(sort: Sort): SortDirection {
  return (sort as any).startsWith('-') ? 'descending' : 'ascending';
}
