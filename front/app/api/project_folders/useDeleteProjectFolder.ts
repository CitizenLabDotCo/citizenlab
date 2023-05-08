import { useMutation, useQueryClient } from '@tanstack/react-query';
import fetcher from 'utils/cl-react-query/fetcher';
import projectFolderKeys from './keys';

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
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: projectFolderKeys.lists(),
      });
      // TODO also invalidate project list once Luuc is finished converting
    },
  });
};

export default useDeleteProjectFolder;
