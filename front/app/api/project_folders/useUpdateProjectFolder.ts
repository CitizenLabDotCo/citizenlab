import { useMutation } from '@tanstack/react-query';
import { CLErrors } from 'typings';

import fetcher from 'utils/cl-react-query/fetcher';

import { IProjectFolder, IUpdatedProjectFolder } from './types';
import { invalidateOnCRUD } from './utils';

export const updateProjectFolder = async ({
  projectFolderId,
  ...requestBody
}: IUpdatedProjectFolder) =>
  fetcher<IProjectFolder>({
    path: `/project_folders/${projectFolderId}`,
    action: 'patch',
    body: { project_folder: { ...requestBody } },
  });

const useUpdateProjectFolder = () => {
  return useMutation<IProjectFolder, CLErrors, IUpdatedProjectFolder>({
    mutationFn: updateProjectFolder,
    onSuccess: async (_data) => {
      invalidateOnCRUD();
    },
  });
};

export default useUpdateProjectFolder;
