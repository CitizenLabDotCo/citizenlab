import { useMutation, useQueryClient } from '@tanstack/react-query';
import { CLErrors } from 'typings';

import fetcher from 'utils/cl-react-query/fetcher';

import mapConfigKeys from './keys';
import { IMapConfig, IMapConfigAttributes } from './types';

type IMapConfigUpdate = {
  mapConfigId: string;
} & IMapConfigAttributes;

const updateMapConfig = ({ mapConfigId, ...map_config }: IMapConfigUpdate) =>
  fetcher<IMapConfig>({
    path: `/map_configs/${mapConfigId}`,
    action: 'patch',
    body: { map_config },
  });

const useUpdateMapConfig = (projectId?: string) => {
  const queryClient = useQueryClient();
  return useMutation<IMapConfig, CLErrors, IMapConfigUpdate>({
    mutationFn: updateMapConfig,
    onSuccess: async (_data, variables) => {
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

export default useUpdateMapConfig;
