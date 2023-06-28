import { useMutation } from '@tanstack/react-query';
import { CLErrors } from 'typings';
import fetcher from 'utils/cl-react-query/fetcher';
import { IMapLayer } from './types';
import streams from 'utils/streams';
import { API_PATH } from 'containers/App/constants';

type IReorderMapLayer = {
  id: string;
  projectId: string;
  ordering: number;
};

const reorderMapLayer = ({ id, projectId, ordering }: IReorderMapLayer) =>
  fetcher<IMapLayer>({
    path: `/projects/${projectId}/map_config/layers/${id}/reorder`,
    action: 'patch',
    body: { layer: { ordering } },
  });

const useReorderMapLayer = () => {
  // const queryClient = useQueryClient();
  return useMutation<IMapLayer, CLErrors, IReorderMapLayer>({
    mutationFn: reorderMapLayer,
    onSuccess: async (_data, variables) => {
      // queryClient.invalidateQueries({ queryKey: causesKeys.lists() });
      await streams.fetchAllWith({
        apiEndpoint: [`${API_PATH}/projects/${variables.projectId}/map_config`],
      });
    },
  });
};

export default useReorderMapLayer;
