import { useMutation } from '@tanstack/react-query';
import { CLErrors } from 'typings';

import adminSearchKeys from 'api/admin_search/keys';

import fetcher from 'utils/cl-react-query/fetcher';
import { queryClient } from 'utils/cl-react-query/queryClient';

import { INewProjectFolderDiff, IProjectFolder } from './types';
import { invalidateOnCRUD } from './utils';

export const addProjectFolder = async (
  requestBody: Partial<INewProjectFolderDiff>
) =>
  fetcher<IProjectFolder>({
    path: `/project_folders`,
    action: 'post',
    body: { project_folder: requestBody },
  });

const useAddProjectFolder = () => {
  return useMutation<IProjectFolder, CLErrors, INewProjectFolderDiff>({
    mutationFn: addProjectFolder,
    onSuccess: async () => {
      invalidateOnCRUD();
      queryClient.invalidateQueries({ queryKey: adminSearchKeys.all() });
    },
  });
};

export default useAddProjectFolder;
