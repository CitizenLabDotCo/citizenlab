import {
  IAppConfigurationSettings,
  TAppConfigurationSetting,
} from 'api/app_configuration/types';
import useAppConfiguration from 'api/app_configuration/useAppConfiguration';

type Parameters = {
  names: TAppConfigurationSetting[];
  onlyCheckAllowed?: boolean;
};

// Non-hook version of useFeatureFlags, for checking many items at once.
export const areFeaturesActive = (
  tenantSettings: IAppConfigurationSettings | undefined,
  { names, onlyCheckAllowed = false }: Parameters
) => {
  const isFeatureActive = (featureName: TAppConfigurationSetting) => {
    const setting = tenantSettings && tenantSettings[featureName];
    const isEnabled =
      setting && 'enabled' in setting ? setting.enabled : undefined;

    return (
      tenantSettings?.[featureName]?.allowed && (onlyCheckAllowed || isEnabled)
    );
  };

  return names.length === 0 || names.some(isFeatureActive);
};

export default function useFeatureFlags(parameters: Parameters) {
  const { data: appConfiguration } = useAppConfiguration();

  return areFeaturesActive(
    appConfiguration?.data.attributes.settings,
    parameters
  );
}
