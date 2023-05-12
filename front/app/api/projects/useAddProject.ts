import { useMutation, useQueryClient } from '@tanstack/react-query';
import projectsKeys from './keys';
import { IProject, IUpdatedProjectProperties } from './types';
import fetcher from 'utils/cl-react-query/fetcher';
import { CLErrors } from 'typings';
import streams from 'utils/streams';
import { API_PATH } from 'containers/App/constants';
import topicsKeys from 'api/topics/keys';
import areasKeys from 'api/areas/keys';

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
      queryClient.invalidateQueries({ queryKey: topicsKeys.lists() });
      queryClient.invalidateQueries({ queryKey: areasKeys.lists() });
      streams.fetchAllWith({
        apiEndpoint: [`${API_PATH}/admin_publications`, `${API_PATH}/users/me`],
      });
    },
  });
};

export default useAddProject;
