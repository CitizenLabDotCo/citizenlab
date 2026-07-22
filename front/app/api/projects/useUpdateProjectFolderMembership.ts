import { useMutation } from '@tanstack/react-query';
import { CLErrors } from 'typings';

import fetcher from 'utils/cl-react-query/fetcher';

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
    },
  });
};

export default useUpdateProjectFolderMembership;
