import { useMutation, useQueryClient } from '@tanstack/react-query';
import fetcher from 'utils/cl-react-query/fetcher';
import ideaImagesKeys from './keys';

const deleteIdeaImage = ({
  ideaId,
  imageId,
}: {
  ideaId: string;
  imageId: string;
}) =>
  fetcher({
    path: `/ideas/${ideaId}/images/${imageId}`,
    action: 'delete',
  });

const useDeleteIdeaImage = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: deleteIdeaImage,
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({
        queryKey: ideaImagesKeys.list({
          ideaId: variables.ideaId,
        }),
      });
    },
  });
};

export default useDeleteIdeaImage;
