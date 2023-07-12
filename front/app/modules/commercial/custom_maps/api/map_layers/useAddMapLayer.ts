import { useMutation, useQueryClient } from '@tanstack/react-query';
import { CLErrors } from 'typings';
import fetcher from 'utils/cl-react-query/fetcher';
import { IMapLayer, IMapLayerAttributes } from './types';
import mapConfigKeys from '../map_config/keys';

type IMapLayerAdd = {
  projectId: string;
} & IMapLayerAttributes;

const addLayer = async ({ projectId, ...layer }: IMapLayerAdd) =>
  fetcher<IMapLayer>({
    path: `/projects/${projectId}/map_config/layers`,
    action: 'post',
    body: { layer },
  });

const useAddMapLayer = () => {
  const queryClient = useQueryClient();
  return useMutation<IMapLayer, CLErrors, IMapLayerAdd>({
    mutationFn: addLayer,
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({
        queryKey: mapConfigKeys.item({ projectId: variables.projectId }),
      });
    },
  });
};

export default useAddMapLayer;
