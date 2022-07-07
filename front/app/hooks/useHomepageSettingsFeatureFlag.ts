import { useState, useEffect } from 'react';
import {
  homepageSettingsStream,
  THomepageEnabledSetting,
  IHomepageSettingsAttributes,
} from 'services/homepageSettings';
import { isNilOrError } from 'utils/helperUtils';

export default function useHomepageSettingsFeatureFlag(
  homepageEnabledSetting: THomepageEnabledSetting
) {
  const [homepageSettings, setHomepageSettings] =
    useState<IHomepageSettingsAttributes | null>(null);

  useEffect(() => {
    const homepageSettingsSubscription =
      homepageSettingsStream().observable.subscribe((homepageSettings) =>
        // it doesn't seem right that we can't return an error here
        setHomepageSettings(homepageSettings.attributes)
      );

    return homepageSettingsSubscription.unsubscribe();
  }, []);

  return !isNilOrError(homepageSettings)
    ? homepageSettings[homepageEnabledSetting]
    : false;
}
