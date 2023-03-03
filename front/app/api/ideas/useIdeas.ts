import { useQuery } from '@tanstack/react-query';
import { CLErrors } from 'typings';
import fetcher from 'utils/cl-react-query/fetcher';
import ideasKeys from './keys';
import { IIdeas, IQueryParameters, IdeasKeys } from './types';

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
  return useQuery<IIdeas, CLErrors, IIdeas, IdeasKeys>({
    queryKey: ideasKeys.list(queryParams),
    queryFn: () => fetchIdeas(queryParams),
  });
};

export default useIdeas;
