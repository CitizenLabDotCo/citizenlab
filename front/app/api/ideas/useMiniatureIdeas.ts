import { useQuery } from '@tanstack/react-query';
import { CLErrors } from 'typings';

import fetcher from 'utils/cl-react-query/fetcher';

import ideasKeys from './keys';
import { IMiniIdeas, IIdeaQueryParameters, IdeasKeys } from './types';

const fetchMiniatureIdeas = (queryParameters: IIdeaQueryParameters) =>
  fetcher<IMiniIdeas>({
    path: `/ideas/mini`,
    action: 'get',
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
