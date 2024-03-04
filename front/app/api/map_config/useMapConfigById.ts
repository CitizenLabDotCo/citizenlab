import { useQuery } from '@tanstack/react-query';
import { CLErrors } from 'typings';
import fetcher from 'utils/cl-react-query/fetcher';
import mapConfigKeys from './keys';
import { MapConfigKeys, IMapConfig } from './types';

const fetchMapConfigById = async ({ mapConfigId }: { mapConfigId?: string }) =>
  fetcher<IMapConfig>({
    path: `/map_configs/${mapConfigId}`,
    action: 'get',
  });

const useMapConfigById = (mapConfigId?: string) => {
  return useQuery<IMapConfig, CLErrors, IMapConfig, MapConfigKeys>({
    queryKey: mapConfigKeys.item({ mapConfigId }),
    queryFn: () => fetchMapConfigById({ mapConfigId }),
    enabled: !!mapConfigId,
  });
};

export default useMapConfigById;
