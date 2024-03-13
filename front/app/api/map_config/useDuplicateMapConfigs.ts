import { useQueries } from '@tanstack/react-query';

import fetcher from 'utils/cl-react-query/fetcher';

import mapConfigKeys from './keys';
import { IMapConfig } from './types';

export const fetchDuplicateConfig = async (id: string | null | undefined) =>
  fetcher<IMapConfig>({
    path: `/map_configs/${id}/duplicate_map_config_and_layers`,
    action: 'post',
    body: {},
  });

export const useDuplicateMapConfigs = (
  mapConfigIds: (string | null | undefined)[]
) => {
  const queries = mapConfigIds?.map((mapConfigId) => {
    return {
      queryKey: mapConfigKeys.item({
        mapConfigId,
      }),
      queryFn: () => fetchDuplicateConfig(mapConfigId),
    };
  });

  return useQueries({ queries });
};

export default useDuplicateMapConfigs;
