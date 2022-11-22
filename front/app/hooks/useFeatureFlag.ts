import { useState, useEffect } from 'react';
import {
  currentAppConfigurationStream,
  IAppConfiguration,
  TAppConfigurationSettingWithEnabled,
  THomepageSetting,
} from 'services/appConfiguration';

export type Parameters = HomepageSettingProps | AppConfigSettingProps;

// For THomepageSetting, you can only use
// this hook to check the allowed value, which still resides in appConfiguration
type HomepageSettingProps = {
  name: THomepageSetting;
  onlyCheckAllowed: true;
};

type AppConfigSettingProps = {
  name: TAppConfigurationSettingWithEnabled;
  onlyCheckAllowed?: boolean;
};

export default function useFeatureFlag({
  name,
  onlyCheckAllowed = false,
}: Parameters): boolean {
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
