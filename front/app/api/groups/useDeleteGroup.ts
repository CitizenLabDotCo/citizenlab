import { useMutation, useQueryClient } from '@tanstack/react-query';
import fetcher from 'utils/cl-react-query/fetcher';
import groupsKeys from './keys';

const deleteGroup = (id: string) =>
  fetcher({
    path: `/groups/${id}`,
    action: 'delete',
  });

const useDeleteGroup = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: deleteGroup,
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: groupsKeys.lists(),
      });
    },
  });
};

export default useDeleteGroup;
