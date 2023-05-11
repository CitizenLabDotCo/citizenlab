import { useMutation, useQueryClient } from '@tanstack/react-query';
import fetcher from 'utils/cl-react-query/fetcher';
import projectFolderImagesKeys from '../project_folder_images/keys';

const deleteProjectFolderImage = ({
  projectFolderId,
  imageId,
}: {
  projectFolderId: string;
  imageId: string;
}) =>
  fetcher({
    path: `/project_folders/${projectFolderId}/files/${imageId}`,
    action: 'delete',
  });

const useDeleteProjectFolderImage = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: deleteProjectFolderImage,
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({
        queryKey: projectFolderImagesKeys.list({
          projectFolderId: variables.projectFolderId,
        }),
      });
    },
  });
};

export default useDeleteProjectFolderImage;
