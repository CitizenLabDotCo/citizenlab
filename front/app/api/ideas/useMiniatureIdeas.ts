import { useQuery } from '@tanstack/react-query';
import { CLErrors } from 'typings';

import fetcher from 'utils/cl-react-query/fetcher';

import ideasKeys from './keys';
import { IMiniIdeas, IIdeaQueryParameters, IdeasKeys } from './types';

const fetchMiniatureIdeas = (queryParameters: IIdeaQueryParameters) =>
  fetcher<IMiniIdeas>({
    path: `/ideas/mini`,
    action: 'get',
    /*
     * Caching is disabled here to prevent performance issues
     * when working with a large list of ideas.
     *
     * This fetch is currently used in the IdeaNavigationButtons component,
     * which is rendered exclusively on the IdeaShow page.
     *
     * Future improvement:
     * Find a more efficient approach to retrieve only the next and
     * previous ideas, avoiding the need to fetch the entire list.
     */
    cacheIndividualItems: false,
    queryParams: {
      ...queryParameters,
      'page[size]': 100000,
    },
  });

const useMiniatureIdeas = (
  queryParams: IIdeaQueryParameters,
  { enabled = true }: { enabled: boolean } = { enabled: true }
) => {
  return useQuery<IMiniIdeas, CLErrors, IMiniIdeas, IdeasKeys>({
    queryKey: ideasKeys.list(queryParams),
    queryFn: () => fetchMiniatureIdeas(queryParams),
    enabled,
  });
};

export default useMiniatureIdeas;
