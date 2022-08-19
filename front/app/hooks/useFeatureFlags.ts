import { useState, useEffect } from 'react';
import {
  currentAppConfigurationStream,
  IAppConfiguration,
  TAppConfigurationSetting,
} from 'services/appConfiguration';

type Parameters = {
  names: TAppConfigurationSetting[];
  onlyCheckAllowed?: boolean;
};

// copied and modified from front/app/hooks/useFeatureFlag.ts
export default function useFeatureFlags({
  names,
  onlyCheckAllowed = false,
}: Parameters) {
  const [tenantSettings, setTenantSettings] = useState<
    | IAppConfiguration['data']['attributes']['settings']
    | undefined
    | null
    | Error
  >(undefined);

  useEffect(() => {
    const subscription = currentAppConfigurationStream().observable.subscribe(
      (tenantSettings) =>
        setTenantSettings(tenantSettings.data.attributes.settings)
    );

    return subscription.unsubscribe();
  }, []);

  const isFeatureActive = (featureName: TAppConfigurationSetting) =>
    tenantSettings?.[featureName]?.allowed &&
    (onlyCheckAllowed || tenantSettings?.[featureName]?.enabled);

  return names.length === 0 || names.some(isFeatureActive);
}
