import { useState, useEffect } from 'react';
import {
  currentAppConfigurationStream,
  IAppConfiguration,
  TAppConfigurationSetting,
} from 'services/appConfiguration';

type Parameters = {
  name: TAppConfigurationSetting;
  onlyCheckAllowed?: boolean;
};

export default function useFeatureFlag({
  name,
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

  return (
    tenantSettings?.[name]?.allowed &&
    (onlyCheckAllowed || tenantSettings?.[name]?.enabled)
  );
}
