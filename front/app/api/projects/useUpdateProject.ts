import { useMutation, useQueryClient } from '@tanstack/react-query';
import { CLErrorsWrapper } from 'typings';
import fetcher from 'utils/cl-react-query/fetcher';
import { IProject, IUpdatedProjectProperties } from './types';
import projectsKeys from './keys';
import topicsKeys from 'api/topics/keys';
import areasKeys from 'api/areas/keys';
import adminPublicationsKeys from 'api/admin_publications/keys';
import adminPublicationsStatusCountsKeys from 'api/admin_publications_status_counts/keys';
import meKeys from 'api/me/keys';

export const updateProject = async ({
  projectId,
  ...requestBody
}: IUpdatedProjectProperties) =>
  fetcher<IProject>({
    path: `/projects/${projectId}`,
    action: 'patch',
    body: { project: { ...requestBody } },
  });

const useUpdateProject = () => {
  const queryClient = useQueryClient();
  return useMutation<IProject, CLErrorsWrapper, IUpdatedProjectProperties>({
    mutationFn: updateProject,
    onSuccess: async (_data) => {
      queryClient.invalidateQueries({ queryKey: projectsKeys.lists() });
      queryClient.invalidateQueries({ queryKey: topicsKeys.lists() });
      queryClient.invalidateQueries({ queryKey: areasKeys.lists() });
      queryClient.invalidateQueries({ queryKey: meKeys.all() });
      queryClient.invalidateQueries({
        queryKey: adminPublicationsKeys.lists(),
      });
      queryClient.invalidateQueries({
        queryKey: adminPublicationsStatusCountsKeys.items(),
      });
    },
  });
};

export default useUpdateProject;
