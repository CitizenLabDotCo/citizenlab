import { useMutation, useQueryClient } from '@tanstack/react-query';
import { CLErrors } from 'typings';
import fetcher from 'utils/cl-react-query/fetcher';
import initiativeImagesKeys from './keys';
import { IInitiativeImage, AddInitiativeImageObject } from './types';

const addInitiativeImage = async ({
  initiativeId,
  ...requestBody
}: AddInitiativeImageObject) => {
  return fetcher<IInitiativeImage>({
    path: `/initiatives/${initiativeId}/images`,
    action: 'post',
    body: requestBody,
  });
};

const useAddInitiativeImage = () => {
  const queryClient = useQueryClient();
  return useMutation<IInitiativeImage, CLErrors, AddInitiativeImageObject>({
    mutationFn: addInitiativeImage,
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({
        queryKey: initiativeImagesKeys.list({
          initiativeId: variables.initiativeId,
        }),
      });
    },
  });
};

export default useAddInitiativeImage;
