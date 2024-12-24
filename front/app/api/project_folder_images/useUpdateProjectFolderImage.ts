import { useMutation, useQueryClient } from '@tanstack/react-query';
import { CLErrors } from 'typings';

import fetcher from 'utils/cl-react-query/fetcher';

import projectFolderImagesKeys from './keys';
import { IProjectFolderImage, UpdateProjectFolderImageObject } from './types';

const updateProjectFolderImage = async ({
  folderId,
  base64,
  alt_text_multiloc,
  imageId,
}: UpdateProjectFolderImageObject) =>
  fetcher<IProjectFolderImage>({
    path: `/project_folders/${folderId}/images/${imageId}`,
    action: 'patch',
    body: { image: { image: base64, alt_text_multiloc } },
  });

const useUpdateProjectFolderImage = () => {
  const queryClient = useQueryClient();
  return useMutation<
    IProjectFolderImage,
    CLErrors,
    UpdateProjectFolderImageObject
  >({
    mutationFn: updateProjectFolderImage,
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({
        queryKey: projectFolderImagesKeys.list({
          folderId: variables.folderId,
        }),
      });
    },
  });
};

export default useUpdateProjectFolderImage;
