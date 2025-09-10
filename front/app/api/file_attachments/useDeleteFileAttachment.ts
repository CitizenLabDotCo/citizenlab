import { useMutation, useQueryClient } from '@tanstack/react-query';

import fetcher from 'utils/cl-react-query/fetcher';

import fileAttachmentsKeys from './keys';

const deleteFileAttachment = (id: string) =>
  fetcher({
    path: `/file_attachments/${id}`,
    action: 'delete',
  });

const useDeleteFileAttachment = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: deleteFileAttachment,
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: fileAttachmentsKeys.lists(),
      });
    },
  });
};

// ts-prune-ignore-next
export default useDeleteFileAttachment;
