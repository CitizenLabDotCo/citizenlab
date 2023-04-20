import fetcher from 'utils/cl-react-query/fetcher';
import mentionsKeys from './keys';
import { IMentions, IQueryParameters } from './types';
import { queryClient } from 'utils/cl-react-query/queryClient';

export const fetchMentions = (queryParams: IQueryParameters) =>
  fetcher<IMentions>({
    path: `/mentions/users`,
    action: 'get',
    queryParams,
  });

const getMentions = (queryParameters: IQueryParameters) => {
  return queryClient.fetchQuery({
    queryKey: mentionsKeys.list(queryParameters),
    queryFn: () => fetchMentions(queryParameters),
  });
};

export default getMentions;
