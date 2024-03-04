import { useMutation, useQueryClient } from '@tanstack/react-query';
import { CLErrors } from 'typings';
import fetcher from 'utils/cl-react-query/fetcher';
import { IMapLayer, IMapLayerAttributes } from './types';
import mapConfigKeys from '../map_config/keys';

type IMapLayerAdd = {
  mapConfigId: string;
} & IMapLayerAttributes;

const addLayer = async ({ mapConfigId, ...layer }: IMapLayerAdd) =>
  fetcher<IMapLayer>({
    path: `/map_configs/${mapConfigId}/layers`,
    action: 'post',
    body: { layer },
  });

const useAddMapLayer = (projectId?: string) => {
  const queryClient = useQueryClient();
  return useMutation<IMapLayer, CLErrors, IMapLayerAdd>({
    mutationFn: addLayer,
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({
        queryKey: mapConfigKeys.item({ mapConfigId: variables.mapConfigId }),
      });
      if (projectId) {
        queryClient.invalidateQueries({
          queryKey: mapConfigKeys.item({ projectId }),
        });
      }
    },
  });
};

export default useAddMapLayer;
