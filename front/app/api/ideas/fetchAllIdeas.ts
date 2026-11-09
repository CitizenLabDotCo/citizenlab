import { IIdeaData, IIdeaQueryParameters } from './types';
import { fetchIdeas } from './useIdeas';

const PAGE_SIZE = 100;

const fetchAllIdeas = async (
  queryParameters: IIdeaQueryParameters<string | string[]>
) => {
  const ideas: IIdeaData[] = [];
  let page = 1;
  let hasNextPage = true;

  while (hasNextPage) {
    const { data, links } = await fetchIdeas({
      ...queryParameters,
      'page[number]': page,
      'page[size]': PAGE_SIZE,
    });

    ideas.push(...data);
    hasNextPage = !!links.next;
    page += 1;
  }

  return ideas;
};

export default fetchAllIdeas;
