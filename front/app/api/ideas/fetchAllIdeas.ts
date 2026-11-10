import { chunk, range } from 'lodash-es';

import { getPageNumberFromUrl } from 'utils/paginationUtils';

import { IIdeaQueryParameters } from './types';
import { fetchIdeas } from './useIdeas';

const PAGE_SIZE = 100;
// Enough to be quick on large phases without flooding the API.
const PARALLEL_PAGES = 5;

const fetchAllIdeas = async (
  queryParameters: IIdeaQueryParameters<string | string[]>
) => {
  const fetchPage = (page: number) =>
    fetchIdeas({
      ...queryParameters,
      'page[number]': page,
      'page[size]': PAGE_SIZE,
    });

  const firstPage = await fetchPage(1);
  const lastPage = getPageNumberFromUrl(firstPage.links.last) ?? 1;
  const pages = [firstPage];

  for (const group of chunk(range(2, lastPage + 1), PARALLEL_PAGES)) {
    pages.push(...(await Promise.all(group.map(fetchPage))));
  }

  return pages.flatMap((page) => page.data);
};

export default fetchAllIdeas;
