import {
  IAppConfigurationData,
  TAppConfigurationSettingWithEnabled,
} from 'services/appConfiguration';

export const showFeatureFlagPaymentTease = (
  appConfig: IAppConfigurationData,
  name: TAppConfigurationSettingWithEnabled
) => {
  const isFeatureFlagAllowed = Boolean(
    appConfig.attributes.settings?.[name]?.allowed
  );

  const isFeatureFlagEnabled = Boolean(
    appConfig.attributes.settings?.[name]?.enabled
  );

  return !isFeatureFlagAllowed || isFeatureFlagEnabled;
};
