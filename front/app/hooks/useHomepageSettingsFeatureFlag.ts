import { THomepageEnabledSetting } from 'services/homepageSettings';
import { TAppConfigurationSetting } from 'services/appConfiguration';
import { isNilOrError } from 'utils/helperUtils';
import useHomepageSettings from './useHomepageSettings';
import useAppConfiguration from './useAppConfiguration';

type TFeatureSectionEnabledSetting = Extract<
  THomepageEnabledSetting,
  'events_widget_enabled' | 'customizable_homepage_banner_enabled'
>;

type TRegularSectionEnabledSetting = Exclude<
  THomepageEnabledSetting,
  TFeatureSectionEnabledSetting
>;

type FeatureSectionParameters = {
  homepageEnabledSetting: TFeatureSectionEnabledSetting;
  appConfigSettingName: Extract<
    TAppConfigurationSetting,
    'events_widget' | 'customizable_homepage_banner'
  >;
};

type RegularSectionParameters = {
  homepageEnabledSetting: TRegularSectionEnabledSetting;
  appConfigSettingName?: never;
};

type Parameters = FeatureSectionParameters | RegularSectionParameters;

export default function useHomepageSettingsFeatureFlag({
  homepageEnabledSetting,
  appConfigSettingName,
}: Parameters) {
  const homepageSettings = useHomepageSettings();
  const appConfig = useAppConfiguration();
  const appConfigSetting =
    appConfigSettingName && !isNilOrError(appConfig)
      ? appConfig.data.attributes.settings?.[appConfigSettingName]
      : null;
  const isAllowed =
    !appConfigSettingName ||
    (!isNilOrError(appConfigSetting) ? appConfigSetting.allowed : false);
  const isEnabled = !isNilOrError(homepageSettings)
    ? homepageSettings.attributes[homepageEnabledSetting]
    : false;

  return isAllowed && isEnabled;
}
