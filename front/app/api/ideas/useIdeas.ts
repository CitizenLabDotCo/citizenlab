import { useQuery } from '@tanstack/react-query';
import { CLErrors } from 'typings';

import fetcher from 'utils/cl-react-query/fetcher';

import ideasKeys from './keys';
import { IIdeas, IIdeaQueryParameters, IdeasKeys } from './types';

type IdeasQueryParameters = IIdeaQueryParameters<string | string[]>;

// TODO: use front/app/components/UI/IdeaSelect/IdeaSingleSelect.tsx instead of increasing this number.
export const defaultPageSize = 26;

const fetchIdeas = (queryParameters: IdeasQueryParameters) =>
  fetcher<IIdeas>({
    path: `/ideas`,
    action: 'get',
    queryParams: {
      ...queryParameters,
      'page[number]': queryParameters['page[number]'] || 1,
      'page[size]': queryParameters['page[size]'] || defaultPageSize,
    },
  });

const useIdeas = (
  queryParams: IdeasQueryParameters,
  { enabled = true }: { enabled: boolean } = { enabled: true }
) => {
  return useQuery<IIdeas, CLErrors, IIdeas, IdeasKeys>({
    queryKey: ideasKeys.list(queryParams),
    queryFn: () => fetchIdeas(queryParams),
    enabled,
  });
};

export default useIdeas;
