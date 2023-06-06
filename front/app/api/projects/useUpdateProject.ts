import { useMutation, useQueryClient } from '@tanstack/react-query';
import { CLErrorsJSON } from 'typings';
import fetcher from 'utils/cl-react-query/fetcher';
import { IProject, IUpdatedProjectProperties } from './types';
import streams from 'utils/streams';
import { API_PATH } from 'containers/App/constants';
import projectsKeys from './keys';
import topicsKeys from 'api/topics/keys';
import areasKeys from 'api/areas/keys';
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
  return useMutation<IProject, CLErrorsJSON, IUpdatedProjectProperties>({
    mutationFn: updateProject,
    onSuccess: async (_data) => {
      queryClient.invalidateQueries({ queryKey: projectsKeys.lists() });
      queryClient.invalidateQueries({ queryKey: topicsKeys.lists() });
      queryClient.invalidateQueries({ queryKey: areasKeys.lists() });
      queryClient.invalidateQueries({ queryKey: meKeys.all() });

      await streams.fetchAllWith({
        apiEndpoint: [
          `${API_PATH}/admin_publications`,
          `${API_PATH}/admin_publications/status_counts`,
        ],
      });
    },
  });
};

export default useUpdateProject;
