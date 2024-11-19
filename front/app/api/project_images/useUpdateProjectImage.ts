import { useMutation, useQueryClient } from '@tanstack/react-query';
import { CLErrors } from 'typings';

import fetcher from 'utils/cl-react-query/fetcher';

import projectImagesKeys from './keys';
import { IProjectImage, UpdateProjectImageObject } from './types';

const updateProjectImage = async ({
  projectId,
  imageId,
  ...requestBody
}: UpdateProjectImageObject) =>
  fetcher<IProjectImage>({
    path: `/projects/${projectId}/images/${imageId}`,
    action: 'patch',
    body: requestBody,
  });

const useUpdateProjectImage = () => {
  const queryClient = useQueryClient();
  return useMutation<IProjectImage, CLErrors, UpdateProjectImageObject>({
    mutationFn: updateProjectImage,
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({
        queryKey: projectImagesKeys.list({
          projectId: variables.projectId,
        }),
      });
    },
  });
};

export default useUpdateProjectImage;
