import { useMutation, useQueryClient } from '@tanstack/react-query';

import contentBuilderKeys from 'api/content_builder/keys';

import fetcher from 'utils/cl-react-query/fetcher';

import { invalidateOnCRUD } from './utils';

const deleteProjectFolder = ({
  projectFolderId,
}: {
  projectFolderId: string;
}) =>
  fetcher({
    path: `/project_folders/${projectFolderId}`,
    action: 'delete',
  });

const useDeleteProjectFolder = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: deleteProjectFolder,
    onSuccess: async () => {
      invalidateOnCRUD();
      queryClient.invalidateQueries({
        queryKey: contentBuilderKeys.all(),
      });
    },
  });
};

export default useDeleteProjectFolder;
