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
  });
};

export default useProjectMapConfig;
