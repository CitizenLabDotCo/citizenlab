import { useState, useEffect } from 'react';
import {
  homepageSettingsStream,
  IHomepageSettings,
} from 'services/homepageSettings';

export default function useHomepageSettings() {
  const [homepageSettings, setHomepageSettings] = useState<
    IHomepageSettings | undefined | null | Error
  >(undefined);

  useEffect(() => {
    const subscription = homepageSettingsStream().observable.subscribe(
      (currentlySavedHomepageSettings) => {
        console.log(currentlySavedHomepageSettings);

        setHomepageSettings(currentlySavedHomepageSettings);
      }
    );

    return () => subscription.unsubscribe();
  }, []);

  return homepageSettings;
}
