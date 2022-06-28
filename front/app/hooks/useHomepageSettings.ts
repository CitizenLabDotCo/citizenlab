import { useState, useEffect } from 'react';
import { homepageSettingsStream, IHomepageSettings } from 'services/homepages';

export default function useAppConfiguration() {
  const [homepageSettings, setHomepageSettings] = useState<
    IHomepageSettings | undefined | null | Error
  >(undefined);

  useEffect(() => {
    const subscription = homepageSettingsStream().observable.subscribe(
      // maybe types to add
      (currentHomepageSettings) => {
        setHomepageSettings(currentHomepageSettings);
      }
    );

    return () => subscription.unsubscribe();
  }, []);

  return homepageSettings;
}
