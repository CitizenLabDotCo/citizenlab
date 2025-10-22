import { useMutation, useQueryClient } from '@tanstack/react-query';
import { CLErrors } from 'typings';

import adminPublicationsKeys from 'api/admin_publications/keys';
import adminPublicationsStatusCountsKeys from 'api/admin_publications_status_counts/keys';
import areasKeys from 'api/areas/keys';
import meKeys from 'api/me/keys';
import projectsMiniAdminKeys from 'api/projects_mini_admin/keys';
import topicsKeys from 'api/topics/keys';

import fetcher from 'utils/cl-react-query/fetcher';

import projectsKeys from './keys';
import { IProject } from './types';

interface AiCreateProjectParams {
  description: string;
}

const aiCreateProject = async (params: AiCreateProjectParams) =>
  fetcher<IProject>({
    path: `/projects/ai_create`,
    action: 'post',
    body: params,
  });

const useAiCreateProject = () => {
  const queryClient = useQueryClient();

  return useMutation<IProject, CLErrors, AiCreateProjectParams>({
    mutationFn: aiCreateProject,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: projectsKeys.lists() });
      queryClient.invalidateQueries({
        queryKey: adminPublicationsKeys.lists(),
      });
      queryClient.invalidateQueries({
        queryKey: adminPublicationsStatusCountsKeys.items(),
      });
      queryClient.invalidateQueries({
        queryKey: projectsMiniAdminKeys.lists(),
      });
      queryClient.invalidateQueries({ queryKey: areasKeys.lists() });
      queryClient.invalidateQueries({ queryKey: topicsKeys.lists() });
      queryClient.invalidateQueries({ queryKey: meKeys.all() });
    },
  });
};

export default useAiCreateProject;
