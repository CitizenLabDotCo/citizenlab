import { useMutation, useQueryClient } from '@tanstack/react-query';
import { CLErrors } from 'typings';
import fetcher from 'utils/cl-react-query/fetcher';
import ideaImagesKeys from './keys';
import { IIdeaImage, AddIdeaImageObject } from './types';

const addIdeaImage = async ({ ideaId, ...requestBody }: AddIdeaImageObject) =>
  fetcher<IIdeaImage>({
    path: `/ideas/${ideaId}/images`,
    action: 'post',
    body: requestBody,
  });

const useAddIdeaImage = () => {
  const queryClient = useQueryClient();
  return useMutation<IIdeaImage, CLErrors, AddIdeaImageObject>({
    mutationFn: addIdeaImage,
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({
        queryKey: ideaImagesKeys.list({
          ideaId: variables.ideaId,
        }),
      });
    },
  });
};

export default useAddIdeaImage;
