import { useQuery } from '@tanstack/react-query';
import { CLErrors } from 'typings';
import fetcher from 'utils/cl-react-query/fetcher';
import ideaKeys from './keys';
import { IIdeas, IQueryParameters, IdeaKeys } from './types';

export const defaultPageSize = 24;

const fetchIdeas = (queryParameters: IQueryParameters) =>
  fetcher<IIdeas>({
    path: `/ideas`,
    action: 'get',
    queryParams: {
      ...queryParameters,
      'page[number]': queryParameters['page[number]'] || 1,
      'page[size]': queryParameters['page[size]'] || defaultPageSize,
    },
  });

const useIdeas = (queryParams: IQueryParameters) => {
  return useQuery<IIdeas, CLErrors, IIdeas, IdeaKeys>({
    queryKey: ideaKeys.list(queryParams),
    queryFn: () => fetchIdeas(queryParams),
  });
};

export default useIdeas;
