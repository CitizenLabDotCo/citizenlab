import { useQuery } from '@tanstack/react-query';
import { CLErrors } from 'typings';
import fetcher from 'utils/cl-react-query/fetcher';
import eventsKeys from './keys';
import { MembershipsKeys, IGroupMemberships, IParameters } from './types';

const fetchMemberships = async ({ groupId, ...rest }: IParameters) =>
  fetcher<IGroupMemberships>({
    path: `/groups/${groupId}/memberships`,
    action: 'get',
    queryParams: rest,
  });

const useMemberships = (parameters: IParameters) => {
  return useQuery<
    IGroupMemberships,
    CLErrors,
    IGroupMemberships,
    MembershipsKeys
  >({
    queryKey: eventsKeys.list(parameters),
    queryFn: () => fetchMemberships(parameters),
  });
};

export default useMemberships;
