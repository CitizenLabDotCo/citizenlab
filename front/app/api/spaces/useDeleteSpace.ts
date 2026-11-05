import { useMutation, useQueryClient } from '@tanstack/react-query';

import fetcher from 'utils/cl-react-query/fetcher';

import spacesKeys from './keys';

const deleteSpace = (id?: string) => {
  return fetcher({
    path: `/spaces/${id}`,
    action: 'delete',
  });
};

const useDeleteSpace = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: deleteSpace,
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: spacesKeys.lists(),
      });
    },
  });
};

export default useDeleteSpace;
