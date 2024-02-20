import { useMutation, useQueryClient } from '@tanstack/react-query';
import { CLErrors } from 'typings';
import fetcher from 'utils/cl-react-query/fetcher';
import { IMapLayer, IMapLayerUpdateAttributes } from './types';
import mapConfigKeys from '../map_config/keys';

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
  const queryClient = useQueryClient();
  return useMutation<IMapLayer, CLErrors, IMapLayerUpdateAttributes>({
    mutationFn: updateMapLayer,
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({
        queryKey: mapConfigKeys.item({ projectId: variables.projectId }),
      });
    },
  });
};

export default useUpdateMapLayer;
