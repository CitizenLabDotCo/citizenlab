import { useQuery } from '@tanstack/react-query';
import { CLErrors } from 'typings';

import fetcher from 'utils/cl-react-query/fetcher';

import pluginKeys from './keys';
import { PluginFrontEntriesResponse, PluginKeys } from './types';

const fetchPluginFrontEntries = () =>
  fetcher<PluginFrontEntriesResponse>({
    path: '/plugins/front_entries',
    action: 'get',
  });

const usePluginFrontEntries = (enabled: boolean) => {
  return useQuery<
    PluginFrontEntriesResponse,
    CLErrors,
    PluginFrontEntriesResponse,
    PluginKeys
  >({
    queryKey: pluginKeys.items(),
    queryFn: fetchPluginFrontEntries,
    enabled,
  });
};

export default usePluginFrontEntries;
