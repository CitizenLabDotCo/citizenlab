import { useQuery } from '@tanstack/react-query';
import { CLErrors } from 'typings';
import fetcher from 'utils/cl-react-query/fetcher';
import causesKeys from './keys';
import { IGroups, GroupsKeys, GroupsQueryParameters } from './types';

const fetchGroups = ({
  pageNumber,
  pageSize,
  membershipType,
}: GroupsQueryParameters) =>
  fetcher<IGroups>({
    path: `/groups`,
    action: 'get',
    queryParams: {
      'page[number]': pageNumber,
      'page[size]': pageSize,
      membership_type: membershipType,
    },
  });

const useGroups = (queryParameters: GroupsQueryParameters) => {
  return useQuery<IGroups, CLErrors, IGroups, GroupsKeys>({
    queryKey: causesKeys.list(queryParameters),
    queryFn: () => fetchGroups(queryParameters),
  });
};

export default useGroups;
