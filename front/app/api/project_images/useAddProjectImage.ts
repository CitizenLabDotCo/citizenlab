import { useMutation, useQueryClient } from '@tanstack/react-query';
import { CLErrors } from 'typings';
import fetcher from 'utils/cl-react-query/fetcher';
import projectImagesKeys from './keys';
import { IProjectImage, AddProjectImageObject } from './types';

export const CARD_IMAGE_ASPECT_RATIO_WIDTH = 4;
export const CARD_IMAGE_ASPECT_RATIO_HEIGHT = 3;
export const CARD_IMAGE_ASPECT_RATIO =
  CARD_IMAGE_ASPECT_RATIO_WIDTH / CARD_IMAGE_ASPECT_RATIO_HEIGHT;

const addProjectImage = async ({
  projectId,
  ...requestBody
}: AddProjectImageObject) =>
  fetcher<IProjectImage>({
    path: `/projects/${projectId}/images`,
    action: 'post',
    body: requestBody,
  });

const useAddProjectImage = () => {
  const queryClient = useQueryClient();
  return useMutation<IProjectImage, CLErrors, AddProjectImageObject>({
    mutationFn: addProjectImage,
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({
        queryKey: projectImagesKeys.list({
          projectId: variables.projectId,
        }),
      });
    },
  });
};

export default useAddProjectImage;
