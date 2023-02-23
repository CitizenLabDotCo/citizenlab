import useAppConfiguration from 'api/app_configuration/useAppConfiguration';
import { TAppConfigurationSetting } from 'api/app_configuration/types';

type Parameters = {
  names: TAppConfigurationSetting[];
  onlyCheckAllowed?: boolean;
};

export default function useFeatureFlags({
  names,
  onlyCheckAllowed = false,
}: Parameters) {
  const { data: appConfiguration } = useAppConfiguration();
  const tenantSettings = appConfiguration?.data.attributes.settings;

  const isFeatureActive = (featureName: TAppConfigurationSetting) => {
    const setting = tenantSettings && tenantSettings[featureName];
    const isEnabled =
      setting && 'enabled' in setting ? setting.enabled : undefined;

    return (
      tenantSettings?.[featureName]?.allowed && (onlyCheckAllowed || isEnabled)
    );
  };

  return names.length === 0 || names.some(isFeatureActive);
}
