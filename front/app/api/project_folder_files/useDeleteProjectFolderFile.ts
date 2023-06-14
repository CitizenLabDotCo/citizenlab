import { useMutation, useQueryClient } from '@tanstack/react-query';
import fetcher from 'utils/cl-react-query/fetcher';
import projectFolderFilesKeys from '../project_folder_files/keys';

const deleteProjectFolderFile = ({
  projectFolderId,
  fileId,
}: {
  projectFolderId: string;
  fileId: string;
}) =>
  fetcher({
    path: `/project_folders/${projectFolderId}/files/${fileId}`,
    action: 'delete',
  });

const useDeleteProjectFolderFile = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: deleteProjectFolderFile,
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({
        queryKey: projectFolderFilesKeys.list({
          projectFolderId: variables.projectFolderId,
        }),
      });
    },
  });
};

export default useDeleteProjectFolderFile;
