import { useMutation, useQueryClient } from '@tanstack/react-query';
import { CLErrors } from 'typings';

import adminPublicationsKeys from 'api/admin_publications/keys';
import adminPublicationsStatusCountsKeys from 'api/admin_publications_status_counts/keys';
import meKeys from 'api/me/keys';
import projectsMiniAdminKeys from 'api/projects_mini_admin/keys';

import fetcher from 'utils/cl-react-query/fetcher';

import projectsKeys from './keys';
import { IProject } from './types';

const copyProject = async (projectId: string) =>
  fetcher<IProject>({
    path: `/projects/${projectId}/copy`,
    action: 'post',
    body: {},
  });

const useCopyProject = () => {
  const queryClient = useQueryClient();

  return useMutation<IProject, CLErrors, string>({
    mutationFn: copyProject,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: projectsKeys.lists() });
      queryClient.invalidateQueries({
        queryKey: adminPublicationsKeys.lists(),
      });
      queryClient.invalidateQueries({
        queryKey: adminPublicationsStatusCountsKeys.items(),
      });
      queryClient.invalidateQueries({ queryKey: meKeys.all() });
      queryClient.invalidateQueries({
        queryKey: projectsMiniAdminKeys.lists(),
      });
    },
  });
};

export default useCopyProject;
