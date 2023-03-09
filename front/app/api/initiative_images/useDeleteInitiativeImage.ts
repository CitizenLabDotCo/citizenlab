import { useMutation, useQueryClient } from '@tanstack/react-query';
import fetcher from 'utils/cl-react-query/fetcher';
import initiativeImagesKeys from './keys';

const deleteInitiativeImage = ({
  initiativeId,
  imageId,
}: {
  initiativeId: string;
  imageId: string;
}) =>
  fetcher({
    path: `/initiatives/${initiativeId}/images/${imageId}`,
    action: 'delete',
  });

const useDeleteInitiativeImage = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: deleteInitiativeImage,
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({
        queryKey: initiativeImagesKeys.list(variables.initiativeId),
      });
    },
  });
};

export default useDeleteInitiativeImage;
