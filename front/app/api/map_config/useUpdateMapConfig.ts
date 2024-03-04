import { useMutation, useQueryClient } from '@tanstack/react-query';
import { CLErrors } from 'typings';
import fetcher from 'utils/cl-react-query/fetcher';
import { IMapConfig, IMapConfigAttributes } from './types';
import mapConfigKeys from './keys';

type IMapConfigUpdate = {
  mapConfigId: string;
} & IMapConfigAttributes;

const updateMapConfig = ({ mapConfigId, ...map_config }: IMapConfigUpdate) =>
  fetcher<IMapConfig>({
    path: `/map_configs/${mapConfigId}`,
    action: 'patch',
    body: { map_config },
  });

const useUpdateMapConfig = (mapConfigId: string) => {
  const queryClient = useQueryClient();
  return useMutation<IMapConfig, CLErrors, IMapConfigUpdate>({
    mutationFn: updateMapConfig,
    onSuccess: async (_data, variables) => {
      queryClient.invalidateQueries({
        queryKey: mapConfigKeys.item({ id: variables.mapConfigId }),
      });
    },
  });
};

export default useUpdateMapConfig;
