import { QueryObserver } from '@tanstack/react-query';
import { CLErrors } from 'typings';
import { queryClient } from 'utils/cl-react-query/queryClient';
import appConfigurationKeys from './keys';
import { AppConfigurationKeys, IAppConfiguration } from './types';

const appConfigurationObserver = new QueryObserver<
  IAppConfiguration,
  CLErrors,
  IAppConfiguration,
  AppConfigurationKeys
>(queryClient, {
  queryKey: appConfigurationKeys.all(),
});

export default appConfigurationObserver;
