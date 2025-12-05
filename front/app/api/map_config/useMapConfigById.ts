import { useQuery } from '@tanstack/react-query';
import { CLErrors } from 'typings';

import fetcher from 'utils/cl-react-query/fetcher';

import mapConfigKeys from './keys';
import { MapConfigKeys, IMapConfig } from './types';

const fetchMapConfigById = async ({ id }: { id?: string | null }) =>
  fetcher<IMapConfig>({
    path: `/map_configs/${id}`,
    action: 'get',
  });

const useMapConfigById = (id?: string | null) => {
  return useQuery<IMapConfig, CLErrors, IMapConfig, MapConfigKeys>({
    queryKey: mapConfigKeys.item({ id }),
    enabled: !!id,
    queryFn: () => fetchMapConfigById({ id }),
  });
};

export default useMapConfigById;
