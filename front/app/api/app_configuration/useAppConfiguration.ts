import { useQuery } from '@tanstack/react-query';
import { CLErrors } from 'typings';
import fetcher from 'utils/cl-react-query/fetcher';
import appConfiguationKeys from './keys';
import { IAppConfiguration, AppConfigurationKeys } from './types';

export const fetchAppConfiguration = () =>
  fetcher<IAppConfiguration>({ path: `/app_configuration`, action: 'get' });

const useAppConfiguration = () => {
  return useQuery<
    IAppConfiguration,
    CLErrors,
    IAppConfiguration,
    AppConfigurationKeys
  >({
    queryKey: appConfiguationKeys.all(),
    queryFn: fetchAppConfiguration,
  });
};

export default useAppConfiguration;
