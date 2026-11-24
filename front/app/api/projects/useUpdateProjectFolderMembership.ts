import { useMutation } from '@tanstack/react-query';
import { CLErrors } from 'typings';

import adminSearchKeys from 'api/admin_search/keys';

import fetcher from 'utils/cl-react-query/fetcher';
import { queryClient } from 'utils/cl-react-query/queryClient';

import { IProject } from './types';
import { invalidateOnCRUD } from './utils';

interface Params {
  projectId: string;
  newProjectFolderId: string | null;
  oldProjectFolderId?: string;
}

const updateProjectFolderMembership = async ({
  projectId,
  newProjectFolderId,
}: Params) =>
  fetcher<IProject>({
    path: `/projects/${projectId}`,
    action: 'patch',
    body: { project: { folder_id: newProjectFolderId } },
  });

const useUpdateProjectFolderMembership = () => {
  return useMutation<IProject, CLErrors, Params>({
    mutationFn: updateProjectFolderMembership,
    onSuccess: () => {
      invalidateOnCRUD();
      queryClient.invalidateQueries({ queryKey: adminSearchKeys.all() });
    },
  });
};

export default useUpdateProjectFolderMembership;
