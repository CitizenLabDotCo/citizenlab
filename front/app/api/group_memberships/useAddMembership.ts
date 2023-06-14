import { useMutation, useQueryClient } from '@tanstack/react-query';
import { CLErrors } from 'typings';
import fetcher from 'utils/cl-react-query/fetcher';

import membershipsKeys from './keys';
import groupsKeys from 'api/groups/keys';

import { IGroupMemberships, MembershipAdd } from './types';

import meKeys from 'api/me/keys';
import usersKeys from 'api/users/keys';

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
    onSuccess: async () => {
      queryClient.invalidateQueries({ queryKey: membershipsKeys.lists() });
      queryClient.invalidateQueries({ queryKey: groupsKeys.lists() });
      queryClient.invalidateQueries({ queryKey: meKeys.all() });
      queryClient.invalidateQueries({ queryKey: usersKeys.lists() });
    },
  });
};

export default useAddMembership;
