import useAppConfiguration from 'api/app_configuration/useAppConfiguration';
import {
  TAppConfigurationSetting,
  THomepageSetting,
} from 'api/app_configuration/types';

type FeatureName = THomepageSetting | TAppConfigurationSetting;

type Parameters = {
  names: FeatureName[];
  onlyCheckAllowed?: boolean;
};

export default function useFeatureFlags({
  names,
  onlyCheckAllowed = false,
}: Parameters) {
  const { data: appConfiguration } = useAppConfiguration();
  const tenantSettings = appConfiguration?.data.attributes.settings;

  const isFeatureActive = (featureName: FeatureName) =>
    tenantSettings?.[featureName]?.allowed &&
    (onlyCheckAllowed || tenantSettings?.[featureName]?.enabled);

  return names.length === 0 || names.some(isFeatureActive);
}
