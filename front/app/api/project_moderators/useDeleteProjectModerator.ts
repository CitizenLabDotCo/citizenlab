import { useMutation, useQueryClient } from '@tanstack/react-query';
import fetcher from 'utils/cl-react-query/fetcher';
import projectModeratorsKeys from './keys';
import invalidateSeatsCache from 'api/seats/invalidateSeatsCache';
import streams from 'utils/streams';
import { API_PATH } from 'containers/App/constants';

const deleteModerator = ({
  projectId,
  id,
}: {
  projectId: string;
  id: string;
}) =>
  fetcher({
    path: `/projects/${projectId}/moderators/${id}`,
    action: 'delete',
  });

const useDeleteProjectModerator = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: deleteModerator,
    onSuccess: async (_data, variables) => {
      queryClient.invalidateQueries({
        queryKey: projectModeratorsKeys.list({
          projectId: variables.projectId,
        }),
      });

      invalidateSeatsCache();

      await streams.fetchAllWith({
        apiEndpoint: [`${API_PATH}/users`],
      });
    },
  });
};

export default useDeleteProjectModerator;
