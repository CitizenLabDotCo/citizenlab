import { useState, useEffect } from 'react';
import {
  homepageSettingsStream,
  IHomepageSettingsData,
} from 'services/homepageSettings';
import { isNilOrError } from 'utils/helperUtils';

export default function useHomepageSettings() {
  const [homepageSettings, setHomepageSettings] = useState<
    IHomepageSettingsData | null | Error
  >(null);

  useEffect(() => {
    const subscription = homepageSettingsStream().observable.subscribe(
      (returnedHomePage) => {
        const apiHomePage = !isNilOrError(returnedHomePage)
          ? returnedHomePage.data
          : returnedHomePage;
        setHomepageSettings(apiHomePage);
      }
    );

    return () => subscription.unsubscribe();
  }, []);

  return homepageSettings;
}
