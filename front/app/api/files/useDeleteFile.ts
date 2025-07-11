import { useMutation, useQueryClient } from '@tanstack/react-query';

import fetcher from 'utils/cl-react-query/fetcher';

import filesKeys from './keys';

const deleteFile = (id: string) =>
  fetcher({
    path: `/files/${id}`,
    action: 'delete',
  });

const useDeleteFile = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: deleteFile,
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: filesKeys.lists(),
      });
    },
  });
};

export default useDeleteFile;
