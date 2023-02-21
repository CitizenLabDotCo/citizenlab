import { QueryObserver } from '@tanstack/react-query';
import { CLErrors } from 'typings';
import { queryClient } from 'utils/cl-react-query/queryClient';
import appConfigurationKeys from './keys';
import { AppConfigurationKeys, IAppConfiguration } from './types';
import { Observable } from 'rxjs';
import { fetchAppConfiguration } from './useAppConfiguration';

const appConfigurationQueryObserver = new QueryObserver<
  IAppConfiguration,
  CLErrors,
  IAppConfiguration,
  AppConfigurationKeys
>(queryClient, {
  queryKey: appConfigurationKeys.all(),
  queryFn: fetchAppConfiguration,
});

const appConfigurationStream = new Observable<IAppConfiguration | undefined>(
  (subscriber) => {
    const unsubscribe = appConfigurationQueryObserver.subscribe((query) => {
      subscriber.next(query?.data);
    });
    return unsubscribe;
  }
);

/** @deprecated Only used for backwards compatibility reasons with streams. Do not use in React components or hooks */
export default appConfigurationStream;
