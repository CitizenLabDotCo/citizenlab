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

const useIdeasInBasket = (queryParameters: QueryParameters) => {
  const queryParametersWithSort = {
    ...queryParameters,
    sort: 'random',
  } as const;

  return useQuery<IIdeas, CLErrors, IIdeas, IdeaKeys>({
    queryKey: ideaKeys.list(queryParametersWithSort),
    queryFn: () => fetchIdeas(queryParametersWithSort),
  });
};

export default useIdeasInBasket;
