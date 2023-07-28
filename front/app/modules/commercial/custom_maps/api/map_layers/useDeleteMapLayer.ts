import { useMutation, useQueryClient } from '@tanstack/react-query';
import fetcher from 'utils/cl-react-query/fetcher';
import mapConfigKeys from '../map_config/keys';

const deleteMapLayer = ({ id, projectId }: { id: string; projectId: string }) =>
  fetcher({
    path: `/projects/${projectId}/map_config/layers/${id}`,
    action: 'delete',
  });

const useDeleteMapLayer = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: deleteMapLayer,
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({
        queryKey: mapConfigKeys.item({ projectId: variables.projectId }),
      });
    },
  });
};

export default useDeleteMapLayer;
