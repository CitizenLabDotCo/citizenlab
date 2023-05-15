import { useMutation, useQueryClient } from '@tanstack/react-query';
import projectsKeys from './keys';
import { IProject } from './types';
import fetcher from 'utils/cl-react-query/fetcher';
import { CLErrors } from 'typings';
import streams from 'utils/streams';
import { API_PATH } from 'containers/App/constants';

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

      streams.fetchAllWith({
        apiEndpoint: [`${API_PATH}/admin_publications`, `${API_PATH}/users/me`],
      });
    },
  });
};

export default useCopyProject;
