import { TAppConfigurationSetting } from 'api/app_configuration/types';
import useAppConfiguration from 'api/app_configuration/useAppConfiguration';

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

  if (!appConfiguration) return false;

  const setting = appConfiguration.data.attributes.settings[name];

  return setting
    ? setting.allowed && (onlyCheckAllowed || setting.enabled)
    : false;
}
