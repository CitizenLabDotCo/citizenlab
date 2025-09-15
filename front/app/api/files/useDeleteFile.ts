import { useMutation, useQueryClient } from '@tanstack/react-query';

import fileAttachmentsKeys from 'api/file_attachments/keys';

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
      queryClient.invalidateQueries({
        queryKey: fileAttachmentsKeys.lists(),
      });
    },
  });
};

export default useDeleteFile;
