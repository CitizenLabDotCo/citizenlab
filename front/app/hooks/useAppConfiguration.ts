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
        // setAppConfiguration(currentAppConfiguration);
        // TODO remove
        setAppConfiguration(updateTileProvider(currentAppConfiguration));
      }
    );

    return () => subscription.unsubscribe();
  }, []);

  return appConfiguration;
}

// TODO remove
const updateTileProvider = (appConfiguration: IAppConfiguration) => {
  const clone = JSON.parse(JSON.stringify(appConfiguration));
  clone.data.attributes.settings.maps.tile_provider =
    'https://api.maptiler.com/maps/hybrid/{z}/{x}/{y}.jpg?key=DIZiuhfkZEQ5EgsaTk6D';

  return clone;
};
