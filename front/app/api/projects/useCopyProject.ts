import { useMutation, useQueryClient } from '@tanstack/react-query';
import projectsKeys from './keys';
import { IProject } from './types';
import fetcher from 'utils/cl-react-query/fetcher';
import { CLErrors } from 'typings';
import streams from 'utils/streams';
import { API_PATH } from 'containers/App/constants';
import meKeys from 'api/me/keys';

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
      queryClient.invalidateQueries({ queryKey: meKeys.all() });

      streams.fetchAllWith({
        apiEndpoint: [`${API_PATH}/admin_publications`],
      });
    },
  });
};

export default useCopyProject;
