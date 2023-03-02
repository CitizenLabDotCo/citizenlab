import { useQuery } from '@tanstack/react-query';
import { CLErrors } from 'typings';
import fetcher from 'utils/cl-react-query/fetcher';
import ideaKeys from './keys';
import { IIdeas, IdeaKeys } from './types';

interface QueryParameters {
  basket_id: string;
  'page[size]': number;
}

const fetchIdeas = (queryParameters: QueryParameters) =>
  fetcher<IIdeas>({
    path: `/ideas`,
    action: 'get',
    queryParams: queryParameters,
  });

const useIdeas = (queryParametersWithoutSort: QueryParameters) => {
  const queryParameters = {
    ...queryParametersWithoutSort,
    sort: 'random',
  } as const;

  return useQuery<IIdeas, CLErrors, IIdeas, IdeaKeys>({
    queryKey: ideaKeys.list(queryParameters),
    queryFn: () => fetchIdeas(queryParameters),
  });
};

export default useIdeas;
