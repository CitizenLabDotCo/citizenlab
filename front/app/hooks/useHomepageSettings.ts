import { useState, useEffect } from 'react';
import {
  homepageSettingsStream,
  IHomepageSettings,
} from 'services/homepageSettings';

export default function useHomepageSettings() {
  const [homepageSettings, setHomepageSettings] = useState<
    IHomepageSettings | null | Error
  >(null);

  useEffect(() => {
    const subscription = homepageSettingsStream().observable.subscribe(
      (currentlySavedHomepageSettings) => {
        setHomepageSettings(currentlySavedHomepageSettings);
      }
    );

    return () => subscription.unsubscribe();
  }, []);

  return homepageSettings;
}
