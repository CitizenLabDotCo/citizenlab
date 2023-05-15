import { useMutation, useQueryClient } from '@tanstack/react-query';
import fetcher from 'utils/cl-react-query/fetcher';
import projectImagesKeys from './keys';

const deleteProjectImage = ({
  projectId,
  imageId,
}: {
  projectId: string;
  imageId: string;
}) =>
  fetcher({
    path: `/projects/${projectId}/images/${imageId}`,
    action: 'delete',
  });

const useDeleteProjectImage = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: deleteProjectImage,
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({
        queryKey: projectImagesKeys.list({
          projectId: variables.projectId,
        }),
      });
    },
  });
};

export default useDeleteProjectImage;
