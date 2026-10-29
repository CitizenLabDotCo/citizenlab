import { useMutation } from '@tanstack/react-query';
import { CLErrors } from 'typings';

import { invalidateAdminSearchIfShownChanged } from 'api/admin_search/utils';

import fetcher from 'utils/cl-react-query/fetcher';
import { queryClient } from 'utils/cl-react-query/queryClient';

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
    onSuccess: async (folder) => {
      invalidateOnCRUD();
      invalidateAdminSearchIfShownChanged(queryClient, {
        id: folder.data.id,
        titleMultiloc: folder.data.attributes.title_multiloc,
      });
    },
  });
};

export default useUpdateProjectFolder;
