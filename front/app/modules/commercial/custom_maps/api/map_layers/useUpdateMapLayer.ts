import { useMutation } from '@tanstack/react-query';
import { CLErrors } from 'typings';
import fetcher from 'utils/cl-react-query/fetcher';
import { IMapLayer, IMapLayerUpdateAttributes } from './types';
import streams from 'utils/streams';
import { API_PATH } from 'containers/App/constants';

const updateMapLayer = ({
  id,
  projectId,
  ...layer
}: IMapLayerUpdateAttributes) =>
  fetcher<IMapLayer>({
    path: `/projects/${projectId}/map_config/layers/${id}`,
    action: 'patch',
    body: { layer },
  });

const useUpdateMapLayer = () => {
  // const queryClient = useQueryClient();
  return useMutation<IMapLayer, CLErrors, IMapLayerUpdateAttributes>({
    mutationFn: updateMapLayer,
    onSuccess: async (_data, variables) => {
      await streams.fetchAllWith({
        apiEndpoint: [`${API_PATH}/projects/${variables.projectId}/map_config`],
      });
      // queryClient.invalidateQueries({ queryKey: causeKeys.lists() });
    },
  });
};

export default useUpdateMapLayer;
