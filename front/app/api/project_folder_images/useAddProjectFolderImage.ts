import { useMutation, useQueryClient } from '@tanstack/react-query';
import { CLErrors } from 'typings';

import fetcher from 'utils/cl-react-query/fetcher';

import projectFolderImagesKeys from './keys';
import { IProjectFolderImage, addProjectFolderImageObject } from './types';

const addProjectFolderImage = async ({
  folderId,
  base64,
  alt_text_multiloc,
}: addProjectFolderImageObject) =>
  fetcher<IProjectFolderImage>({
    path: `/project_folders/${folderId}/images`,
    action: 'post',
    body: { image: { image: base64, alt_text_multiloc } },
  });

const useAddProjectFolderImage = () => {
  const queryClient = useQueryClient();
  return useMutation<
    IProjectFolderImage,
    CLErrors,
    addProjectFolderImageObject
  >({
    mutationFn: addProjectFolderImage,
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({
        queryKey: projectFolderImagesKeys.list({
          folderId: variables.folderId,
        }),
      });
    },
  });
};

export default useAddProjectFolderImage;
