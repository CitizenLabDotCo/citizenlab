import { useMutation } from '@tanstack/react-query';
import { API_PATH } from 'containers/App/constants';
import fetcher from 'utils/cl-react-query/fetcher';
import streams from 'utils/streams';

const deleteMapLayer = ({ id, projectId }: { id: string; projectId: string }) =>
  fetcher({
    path: `/projects/${projectId}/map_config/layers/${id}`,
    action: 'delete',
  });

const useDeleteMapLayer = () => {
  // const queryClient = useQueryClient();

  return useMutation({
    mutationFn: deleteMapLayer,
    onSuccess: async (_data, variables) => {
      await streams.fetchAllWith({
        apiEndpoint: [`${API_PATH}/projects/${variables.projectId}/map_config`],
      });
    },
  });
};

export default useDeleteMapLayer;
