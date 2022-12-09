import { parse } from 'qs';
import { isNil } from 'utils/helperUtils';

export function getPageNumberFromUrl(url: string) {
  if (url === '') return null;
  const queryString = url.split('?')[1];
  const queryObject = parse(queryString)?.query as any;
  const result = queryObject?.page?.['number'];
  return isNil(result) || result < 0 ? null : parseInt(result, 10);
}
