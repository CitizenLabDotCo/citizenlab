import fetcher from 'utils/cl-react-query/fetcher';
import mentionsKeys from './keys';
import { IMentions, IQueryParameters, MentionsKeys } from './types';
import { queryClient } from 'utils/cl-react-query/queryClient';
import { CLErrors } from 'typings';

export const fetchMentions = (queryParams: IQueryParameters) =>
  fetcher<IMentions>({
    path: `/mentions/users`,
    action: 'get',
    queryParams,
  });

const getMentions = (queryParameters: IQueryParameters) => {
  return queryClient.fetchQuery<IMentions, CLErrors, IMentions, MentionsKeys>({
    queryKey: mentionsKeys.list(queryParameters),
    queryFn: () => fetchMentions(queryParameters),
  });
};

export default getMentions;
