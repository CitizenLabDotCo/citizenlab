import { useMutation, useQueryClient } from '@tanstack/react-query';
import { CLErrors } from 'typings';

import fetcher from 'utils/cl-react-query/fetcher';

import mapConfigKeys from '../map_config/keys';

import { IMapLayer } from './types';

type IReorderMapLayer = {
  id: string;
  mapConfigId: string;
  ordering: number;
};

const reorderMapLayer = ({ id, mapConfigId, ordering }: IReorderMapLayer) =>
  fetcher<IMapLayer>({
    path: `/map_configs/${mapConfigId}/layers/${id}/reorder`,
    action: 'patch',
    body: { layer: { ordering } },
  });

const useReorderMapLayer = (projectId?: string) => {
  const queryClient = useQueryClient();
  return useMutation<IMapLayer, CLErrors, IReorderMapLayer>({
    mutationFn: reorderMapLayer,
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

export default useReorderMapLayer;
