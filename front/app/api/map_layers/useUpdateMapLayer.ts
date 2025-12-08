import { useMutation, useQueryClient } from '@tanstack/react-query';
import { CLErrors } from 'typings';

import fetcher from 'utils/cl-react-query/fetcher';

import mapConfigKeys from '../map_config/keys';

import { IMapLayer, IMapLayerUpdateAttributes } from './types';

const updateMapLayer = ({
  id,
  mapConfigId,
  ...layer
}: IMapLayerUpdateAttributes) =>
  fetcher<IMapLayer>({
    path: `/map_configs/${mapConfigId}/layers/${id}`,
    action: 'patch',
    body: { layer },
  });

const useUpdateMapLayer = (projectId?: string) => {
  const queryClient = useQueryClient();
  return useMutation<IMapLayer, CLErrors, IMapLayerUpdateAttributes>({
    mutationFn: updateMapLayer,
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({
        queryKey: mapConfigKeys.item({ id: variables.mapConfigId }),
      });
      if (projectId) {
        queryClient.invalidateQueries({
          queryKey: mapConfigKeys.item({ projectId }),
        });
      }
    },
  });
};

export default useUpdateMapLayer;
