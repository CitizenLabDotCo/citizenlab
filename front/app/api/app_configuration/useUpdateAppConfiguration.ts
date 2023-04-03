import { useMutation, useQueryClient } from '@tanstack/react-query';
import { CLErrors } from 'typings';
import fetcher from 'utils/cl-react-query/fetcher';
import appConfigurationKeys from './keys';
import { IAppConfiguration, IUpdatedAppConfigurationProperties } from './types';

const updateAppConfiguration = (
  requestBody: IUpdatedAppConfigurationProperties
) =>
  fetcher<IAppConfiguration>({
    path: `/app_configuration`,
    action: 'patch',
    body: requestBody,
  });

const useUpdateAppConfiguration = () => {
  const queryClient = useQueryClient();
  return useMutation<
    IAppConfiguration,
    CLErrors,
    IUpdatedAppConfigurationProperties
  >({
    mutationFn: updateAppConfiguration,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: appConfigurationKeys.all() });
    },
  });
};

export default useUpdateAppConfiguration;
