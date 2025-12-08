import { useQuery } from '@tanstack/react-query';
import { CLErrors } from 'typings';

import fetcher from 'utils/cl-react-query/fetcher';

import mapConfigKeys from './keys';
import { MapConfigKeys, IMapConfig } from './types';

const fetchMapConfigById = async ({
  mapConfigId,
}: {
  mapConfigId?: string | null;
}) =>
  fetcher<IMapConfig>({
    path: `/map_configs/${mapConfigId}`,
    action: 'get',
  });

const useMapConfigById = (mapConfigId?: string | null) => {
  return useQuery<IMapConfig, CLErrors, IMapConfig, MapConfigKeys>({
    queryKey: mapConfigKeys.item({ id: mapConfigId }),
    queryFn: () => fetchMapConfigById({ mapConfigId }),
    enabled: !!mapConfigId,
    cacheTime: 0, // Disable caching to always fetch the latest map config. Otherwise, it causes problems in the map page view.
  });
};

export default useMapConfigById;
