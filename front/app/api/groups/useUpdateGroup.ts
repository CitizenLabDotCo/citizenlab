import { useMutation, useQueryClient } from '@tanstack/react-query';
import { CLErrors } from 'typings';

import usersKeys from 'api/users/keys';

import fetcher from 'utils/cl-react-query/fetcher';

import groupKeys from './keys';
import { IGroup, IGroupUpdate } from './types';

const updateGroup = ({ id, ...requestBody }: IGroupUpdate) =>
  fetcher<IGroup>({
    path: `/groups/${id}`,
    action: 'patch',
    body: { group: requestBody },
  });

const useUpdateGroup = () => {
  const queryClient = useQueryClient();
  return useMutation<IGroup, CLErrors, IGroupUpdate>({
    mutationFn: updateGroup,
    onSuccess: async () => {
      queryClient.invalidateQueries({ queryKey: groupKeys.lists() });
      queryClient.invalidateQueries({ queryKey: usersKeys.lists() });
    },
  });
};

export default useUpdateGroup;
