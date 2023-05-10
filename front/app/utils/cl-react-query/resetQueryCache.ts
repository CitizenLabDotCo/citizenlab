import appConfigurationKeys from 'api/app_configuration/keys';
import { fetchAppConfiguration } from 'api/app_configuration/useAppConfiguration';
import { queryClient } from './queryClient';

export const resetQueryCache = async () => {
  queryClient.resetQueries();
  await queryClient.prefetchQuery({
    queryKey: appConfigurationKeys.all(),
    queryFn: fetchAppConfiguration,
  });
};
