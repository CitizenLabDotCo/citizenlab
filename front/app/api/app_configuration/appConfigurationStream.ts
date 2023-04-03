import { QueryObserver } from '@tanstack/react-query';
import { CLErrors } from 'typings';
import { queryClient } from 'utils/cl-react-query/queryClient';
import appConfigurationKeys from './keys';
import { AppConfigurationKeys, IAppConfiguration } from './types';
import { BehaviorSubject } from 'rxjs';
import { fetchAppConfiguration } from './useAppConfiguration';

const appConfigurationStream = new BehaviorSubject<
  IAppConfiguration | undefined
>(undefined);

const appConfigurationQueryObserver = new QueryObserver<
  IAppConfiguration,
  CLErrors,
  IAppConfiguration,
  AppConfigurationKeys
>(queryClient, {
  queryKey: appConfigurationKeys.all(),
  queryFn: fetchAppConfiguration,
});

appConfigurationQueryObserver.subscribe((query) => {
  return appConfigurationStream.next(query?.data);
});

/** @deprecated Only used for backwards compatibility reasons with streams. Do not use in React components or hooks */
export default appConfigurationStream;
