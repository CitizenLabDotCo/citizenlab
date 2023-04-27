import { useMutation, useQueryClient } from '@tanstack/react-query';
import { CLErrors } from 'typings';
import fetcher from 'utils/cl-react-query/fetcher';
import membershipsKeys from './keys';
import { IGroupMemberships, MembershipAdd } from './types';

const addMembership = async ({ groupId, userId }: MembershipAdd) =>
  fetcher<IGroupMemberships>({
    path: `/groups/${groupId}/memberships`,
    action: 'post',
    body: { membership: { user_id: userId } },
  });

const useAddMembership = () => {
  const queryClient = useQueryClient();
  return useMutation<IGroupMemberships, CLErrors, MembershipAdd>({
    mutationFn: addMembership,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: membershipsKeys.lists() });
    },
  });
};

export default useAddMembership;
