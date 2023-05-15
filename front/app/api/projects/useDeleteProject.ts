import { useMutation, useQueryClient } from '@tanstack/react-query';
import { API_PATH } from 'containers/App/constants';
import fetcher from 'utils/cl-react-query/fetcher';
import streams from 'utils/streams';
import projectsKeys from './keys';

const deleteProject = (id: string) =>
  fetcher({
    path: `/projects/${id}`,
    action: 'delete',
  });

const useDeleteProject = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: deleteProject,
    onSuccess: (_data, id) => {
      queryClient.invalidateQueries({ queryKey: projectsKeys.lists() });
      queryClient.invalidateQueries({ queryKey: projectsKeys.item({ id }) });

      streams.fetchAllWith({
        apiEndpoint: [`${API_PATH}/admin_publications`],
      });
    },
  });
};

export default useDeleteProject;
