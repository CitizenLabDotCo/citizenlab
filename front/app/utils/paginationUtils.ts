import { parse } from 'query-string';
import Url from 'url-parse';

export type SortDirection = 'ascending' | 'descending';

export function getPageNumberFromUrl(url: string) {
  if (url === '') return null;

  const queryString = new Url(url).query;
  const parsedQueryString = parse(queryString);
  const pageNumber = parsedQueryString['page[number]'];

  return typeof pageNumber === 'string' && parseInt(pageNumber, 10) > 0
    ? parseInt(pageNumber, 10)
    : null;
}

export function getSortAttribute<Sort, SortAttribute>(sort: Sort) {
  return (sort as any).replace(/^-/, '') as SortAttribute;
}

export function getSortDirection<Sort>(sort: Sort): SortDirection {
  return (sort as any).startsWith('-') ? 'descending' : 'ascending';
}
