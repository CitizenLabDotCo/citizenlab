import { useState, useEffect } from 'react';
import {
  currentAppConfigurationStream,
  IAppConfiguration,
  IAppConfigurationData,
} from 'services/appConfiguration';
import { isNilOrError, NilOrError } from 'utils/helperUtils';

export default function useAppConfiguration() {
  const [appConfiguration, setAppConfiguration] = useState<
    IAppConfigurationData | NilOrError
  >(undefined);

  useEffect(() => {
    const subscription = currentAppConfigurationStream().observable.subscribe(
      (currentAppConfiguration: IAppConfiguration | NilOrError) => {
        isNilOrError(currentAppConfiguration)
          ? setAppConfiguration(currentAppConfiguration)
          : setAppConfiguration(currentAppConfiguration.data);
      }
    );

    return () => subscription.unsubscribe();
  }, []);

  return appConfiguration;
}
