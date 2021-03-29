import { useState, useEffect } from 'react';
import {
  currentAppConfigurationStream,
  IAppConfiguration,
} from 'services/appConfiguration';

export default function useAppConfiguration() {
  const [appConfiguration, setAppConfiguration] = useState<
    IAppConfiguration | undefined | null | Error
  >(undefined);

  useEffect(() => {
    const subscription = currentAppConfigurationStream().observable.subscribe(
      (currentAppConfiguration) => {
        setAppConfiguration(currentAppConfiguration);
      }
    );

    return () => subscription.unsubscribe();
  }, []);

  return appConfiguration;
}
