import { THomepageEnabledSetting } from 'services/homepageSettings';
import { TAppConfigurationSetting } from 'services/appConfiguration';
import { isNilOrError } from 'utils/helperUtils';
import useHomepageSettings from './useHomepageSettings';
import useAppConfiguration from './useAppConfiguration';

// Enabled values for sections that have a corresponding
// setting in appConfiguration.ts
type TFeatureSectionEnabledSetting = Extract<
  THomepageEnabledSetting,
  'events_widget_enabled' | 'customizable_homepage_banner_enabled'
>;

// Enabled values for sections that DON'T have a corresponding
// setting in appConfiguration.ts (are regular sections)
type TRegularSectionEnabledSetting = Exclude<
  THomepageEnabledSetting,
  TFeatureSectionEnabledSetting
>;

// If we deal with a section whose allowed value needs to be checked
// in appConfiguration, we requre the appConfiguration setting name.
// Otherwise, we just need the enabled value that can be found in homepageSettings.
type Parameters = FeatureSectionParameters | RegularSectionParameters;

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

export default function useHomepageSettingsFeatureFlag({
  homepageEnabledSetting,
  appConfigSettingName,
}: Parameters) {
  const homepageSettings = useHomepageSettings();
  const appConfig = useAppConfiguration();
  // It only makes sense to have appConfigSetting if there's an appConfigSettingName
  const appConfigSetting =
    appConfigSettingName && !isNilOrError(appConfig)
      ? appConfig.data.attributes.settings?.[appConfigSettingName]
      : null;
  // If there's no appConfigSetting, a homepageSetting
  // is always allowed.
  const isAllowed =
    !appConfigSettingName ||
    (!isNilOrError(appConfigSetting) ? appConfigSetting.allowed : false);
  const isEnabled = !isNilOrError(homepageSettings)
    ? homepageSettings.data.attributes[homepageEnabledSetting]
    : false;

  return isAllowed && isEnabled;
}
