import useAppConfiguration from 'api/app_configuration/useAppConfiguration';
import { TAppConfigurationSetting } from 'api/app_configuration/types';

export type Parameters = AppConfigSettingProps;

type AppConfigSettingProps = {
  name: TAppConfigurationSetting;
  onlyCheckAllowed?: boolean;
};

export default function useFeatureFlag({
  name,
  onlyCheckAllowed = false,
}: Parameters): boolean {
  const { data: appConfiguration } = useAppConfiguration();
  const tenantSettings = appConfiguration?.data.attributes.settings;

  const setting = tenantSettings && tenantSettings[name];
  const isEnabled =
    setting && 'enabled' in setting ? setting.enabled : undefined;

  return Boolean(
    tenantSettings?.[name]?.allowed && (onlyCheckAllowed || isEnabled)
  );
}
