import { useMutation, useQueryClient } from '@tanstack/react-query';
import { CLErrors } from 'typings';
import fetcher from 'utils/cl-react-query/fetcher';
import appConfigurationKeys from './keys';
import { IHomepageSettings, IHomepageSettingsAttributes } from './types';

const updateHomepageSettings = (
  requestBody: Partial<IHomepageSettingsAttributes>
) =>
  fetcher<IHomepageSettings>({
    path: `/home_page`,
    action: 'patch',
    body: requestBody,
  });

const useUpdateHomepageSettings = () => {
  const queryClient = useQueryClient();
  return useMutation<
    IHomepageSettings,
    CLErrors,
    Partial<IHomepageSettingsAttributes>
  >({
    mutationFn: updateHomepageSettings,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: appConfigurationKeys.all() });
    },
  });
};

export default useUpdateHomepageSettings;
