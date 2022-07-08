import { THomepageEnabledSetting } from 'services/homepageSettings';
import { TAppConfigurationSetting } from 'services/appConfiguration';
import { isNilOrError } from 'utils/helperUtils';
import useHomepageSettings from './useHomepageSettings';
import useAppConfiguration from './useAppConfiguration';

type TFeatureSectionHomepageEnabledSetting = Extract<
  THomepageEnabledSetting,
  'events_widget_enabled' | 'customizable_homepage_banner_enabled'
>;

type TRegularSectionHomepageEnabledSetting = Exclude<
  THomepageEnabledSetting,
  TFeatureSectionHomepageEnabledSetting
>;

type FeatureSectionParameters = {
  homepageEnabledSetting: TFeatureSectionHomepageEnabledSetting;
  homePageAllowedSettingName: Extract<
    TAppConfigurationSetting,
    'events_widget' | 'customizable_homepage_banner'
  >;
};

type RegularSectionParameters = {
  homepageEnabledSetting: TRegularSectionHomepageEnabledSetting;
  homePageAllowedSettingName?: never;
};

type Parameters = FeatureSectionParameters | RegularSectionParameters;

export default function useHomepageSettingsFeatureFlag({
  homepageEnabledSetting,
  homePageAllowedSettingName,
}: Parameters) {
  const homepageSettings = useHomepageSettings();
  const appConfig = useAppConfiguration();
  const appConfigSetting =
    homePageAllowedSettingName && !isNilOrError(appConfig)
      ? appConfig.data.attributes.settings?.[homePageAllowedSettingName]
      : null;
  const isEnabled = !isNilOrError(homepageSettings)
    ? homepageSettings.attributes[homepageEnabledSetting]
    : false;
  const isAllowed =
    !homePageAllowedSettingName ||
    (!isNilOrError(appConfigSetting) ? appConfigSetting.allowed : false);

  return isAllowed && isEnabled;
}
