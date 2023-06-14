import { useMutation, useQueryClient } from '@tanstack/react-query';
import { CLErrors } from 'typings';
import fetcher from 'utils/cl-react-query/fetcher';
import groupsKeys from './keys';
import { IGroup, IGroupAdd } from './types';

const addGroup = async (requestBody: IGroupAdd) =>
  fetcher<IGroup>({
    path: '/groups',
    action: 'post',
    body: { group: requestBody },
  });

const useAddGroup = () => {
  const queryClient = useQueryClient();
  return useMutation<IGroup, CLErrors, IGroupAdd>({
    mutationFn: addGroup,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: groupsKeys.lists() });
    },
  });
};

export default useAddGroup;
