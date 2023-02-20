import useAppConfiguration from 'api/app_configuration/useAppConfiguration';
import {
  TAppConfigurationSettingWithEnabled,
  THomepageSetting,
} from 'api/app_configuration/types';

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
  const { data: appConfiguration } = useAppConfiguration();
  const tenantSettings = appConfiguration?.data.attributes.settings;

  return (
    tenantSettings?.[name]?.allowed &&
    (onlyCheckAllowed || tenantSettings?.[name]?.enabled)
  );
}
