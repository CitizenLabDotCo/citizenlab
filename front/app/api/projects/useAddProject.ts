import { useMutation, useQueryClient } from '@tanstack/react-query';
import { CLErrors } from 'typings';

import adminPublicationsKeys from 'api/admin_publications/keys';
import adminPublicationsStatusCountsKeys from 'api/admin_publications_status_counts/keys';
import areasKeys from 'api/areas/keys';
import globalTopicsKeys from 'api/global_topics/keys';
import meKeys from 'api/me/keys';
import projectsMiniAdminKeys from 'api/projects_mini_admin/keys';

import fetcher from 'utils/cl-react-query/fetcher';

import projectsKeys from './keys';
import { IProject, IUpdatedProjectProperties } from './types';

const addProject = async (project: IUpdatedProjectProperties) =>
  fetcher<IProject>({
    path: `/projects`,
    action: 'post',
    body: { project },
  });

const useAddProject = () => {
  const queryClient = useQueryClient();

  return useMutation<IProject, CLErrors, IUpdatedProjectProperties>({
    mutationFn: addProject,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: projectsKeys.lists() });
      queryClient.invalidateQueries({ queryKey: globalTopicsKeys.lists() });
      queryClient.invalidateQueries({ queryKey: areasKeys.lists() });
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

export default useAddProject;
