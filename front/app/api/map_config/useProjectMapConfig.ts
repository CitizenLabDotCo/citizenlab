import { useQuery } from '@tanstack/react-query';
import { CLErrors } from 'typings';

import fetcher from 'utils/cl-react-query/fetcher';

import mapConfigKeys from './keys';
import { MapConfigKeys, IMapConfig } from './types';

const fetchMapConfig = async ({ projectId }: { projectId?: string }) =>
  fetcher<IMapConfig>({
    path: `/projects/${projectId}/map_config`,
    action: 'get',
  });

const useProjectMapConfig = (projectId?: string) => {
  return useQuery<IMapConfig, CLErrors, IMapConfig, MapConfigKeys>({
    queryKey: mapConfigKeys.item({ projectId }),
    queryFn: () => fetchMapConfig({ projectId }),
    enabled: !!projectId,
    cacheTime: 0, // Disable caching to always fetch the latest map config. Otherwise, it causes problems in the map page view.
  });
};

export default useProjectMapConfig;
