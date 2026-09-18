import { TAppConfigurationSetting } from 'api/app_configuration/types';
import useAppConfiguration from 'api/app_configuration/useAppConfiguration';

export type Parameters = AppConfigSettingProps;

type AppConfigSettingProps = {
  name: TAppConfigurationSetting;
  onlyCheckAllowed?: boolean;
  onlyCheckEnabled?: boolean;
};

// Test branch only: force these on for every tenant, whatever their stored
// settings say, so the epic preview shows them to all users. Not for master.
const FORCED_ON: TAppConfigurationSetting[] = ['project_backoffice_redesign'];

export default function useFeatureFlag({
  name,
  onlyCheckAllowed = false,
  onlyCheckEnabled = false,
}: Parameters): boolean {
  const { data: appConfiguration } = useAppConfiguration();

  if (FORCED_ON.includes(name)) return true;

  if (!appConfiguration) return false;

  const setting = appConfiguration.data.attributes.settings[name];

  if (onlyCheckEnabled) {
    return setting ? setting.enabled : false;
  }

  return setting
    ? setting.allowed && (onlyCheckAllowed || setting.enabled)
    : false;
}
