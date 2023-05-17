import { useMutation, useQueryClient } from '@tanstack/react-query';
import { CLErrors } from 'typings';
import fetcher from 'utils/cl-react-query/fetcher';

import membershipsKeys from './keys';
import groupsKeys from 'api/groups/keys';

import { IGroupMemberships, MembershipAdd } from './types';

import streams from 'utils/streams';
import { API_PATH } from 'containers/App/constants';
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
      queryClient.invalidateQueries({ queryKey: usersKeys.lists() });

      await streams.fetchAllWith({
        apiEndpoint: [`${API_PATH}/users/me`],
      });
    },
  });
};

export default useAddMembership;
