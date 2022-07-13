import { useState, useEffect } from 'react';
import {
  currentAppConfigurationStream,
  IAppConfiguration,
  TAppConfigurationSetting,
} from 'services/appConfiguration';
import { THomepageAppConfigSettingName } from 'hooks/useHomepageSettingsFeatureFlag';

// All appConfig setting names except those that should be checked
// in homepageSettings/useHomepageSettingsFeatureFlag
export type TSettingName = Exclude<
  TAppConfigurationSetting,
  THomepageAppConfigSettingName
>;

export type Parameters = HomepageSettingProps | AppConfigSettingProps;

// For THomepageAppConfigSettingName, you can only use
// this hook to check the allowed value, that is in appConfiguration
type HomepageSettingProps = {
  name: THomepageAppConfigSettingName;
  onlyCheckAllowed: true;
};

type AppConfigSettingProps = {
  name: TSettingName;
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
