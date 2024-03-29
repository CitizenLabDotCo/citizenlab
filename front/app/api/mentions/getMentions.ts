import { CLErrors } from 'typings';

import fetcher from 'utils/cl-react-query/fetcher';
import { queryClient } from 'utils/cl-react-query/queryClient';

import mentionsKeys from './keys';
import { IMentions, IQueryParameters, MentionsKeys } from './types';

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
