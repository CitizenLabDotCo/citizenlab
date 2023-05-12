import { useMutation, useQueryClient } from '@tanstack/react-query';
import { CLErrors } from 'typings';
import fetcher from 'utils/cl-react-query/fetcher';
import { IProject, IUpdatedProjectProperties } from './types';
import streams from 'utils/streams';
import { API_PATH } from 'containers/App/constants';
import projectsKeys from './keys';

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
  return useMutation<IProject, CLErrors, IUpdatedProjectProperties>({
    mutationFn: updateProject,
    onSuccess: async (_data) => {
      queryClient.invalidateQueries({ queryKey: projectsKeys.lists() });
      await streams.fetchAllWith({
        partialApiEndpoint: [`${API_PATH}/admin_publications`],
      });
    },
  });
};

export default useUpdateProject;
