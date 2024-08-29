import { useMutation, useQueryClient } from '@tanstack/react-query';

import fetcher from 'utils/cl-react-query/fetcher';

import pageFilesKeys from './keys';

const deletePageFile = ({
  pageId,
  fileId,
}: {
  pageId: string;
  fileId: string;
}) =>
  fetcher({
    path: `/static_pages/${pageId}/files/${fileId}`,
    action: 'delete',
  });

const useDeletePageFile = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: deletePageFile,
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: pageFilesKeys.lists(),
      });
    },
  });
};

export default useDeletePageFile;
