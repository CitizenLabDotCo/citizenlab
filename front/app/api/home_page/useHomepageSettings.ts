import { useQuery } from '@tanstack/react-query';
import { CLErrors } from 'typings';
import fetcher from 'utils/cl-react-query/fetcher';
import homepageSettingsKeys from './keys';
import { IHomepageSettings, HomepageSettingsKeys } from './types';

export const fetchHomepageSettings = () =>
  fetcher<IHomepageSettings>({ path: `/home_page`, action: 'get' });

const useHomepageSettings = () => {
  return useQuery<
    IHomepageSettings,
    CLErrors,
    IHomepageSettings,
    HomepageSettingsKeys
  >({
    queryKey: homepageSettingsKeys.all(),
    queryFn: fetchHomepageSettings,
  });
};

export default useHomepageSettings;
