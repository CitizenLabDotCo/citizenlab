import { useQuery } from '@tanstack/react-query';
import { CLErrors } from 'typings';
import fetcher from 'utils/cl-react-query/fetcher';
import mentionsKeys from './keys';
import { IMentions, IQueryParameters, MentionsKeys } from './types';

const fetchMentions = (queryParams: IQueryParameters) =>
  fetcher<IMentions>({
    path: `/mentions/users`,
    action: 'get',
    queryParams,
  });

const useMentions = (queryParams: IQueryParameters) => {
  return useQuery<IMentions, CLErrors, IMentions, MentionsKeys>({
    queryKey: mentionsKeys.list(queryParams),
    queryFn: () => fetchMentions(queryParams),
  });
};

export default useMentions;
