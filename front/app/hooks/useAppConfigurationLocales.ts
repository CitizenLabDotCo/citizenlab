import { useState, useEffect } from 'react';
import { currentAppConfigurationStream } from 'services/appConfiguration';
import { Locale } from 'typings';
import { isNilOrError } from 'utils/helperUtils';

export default function useAppConfigurationLocales() {
  const [appConfigurationLocales, setAppConfigurationLocales] = useState<
    Locale[] | undefined | null | Error
  >(undefined);

  useEffect(() => {
    const subscription = currentAppConfigurationStream().observable.subscribe(
      (currentAppConfiguration) => {
        setAppConfigurationLocales(
          !isNilOrError(currentAppConfiguration)
            ? currentAppConfiguration.data.attributes.settings.core.locales
            : currentAppConfiguration
        );
      }
    );
    return () => subscription.unsubscribe();
  }, []);

  return appConfigurationLocales;
}
