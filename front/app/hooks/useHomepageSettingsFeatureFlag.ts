import {
  TAppConfigSectionSetting,
  TSectionSetting,
} from 'services/homepageSettings';
import { THomepageSetting } from 'services/appConfiguration';
import { isNilOrError } from 'utils/helperUtils';
import useHomepageSettings from './useHomepageSettings';
import useAppConfiguration from './useAppConfiguration';

// If we deal with a section whose allowed value needs to be checked
// in appConfiguration, we require the appConfiguration setting name.
// Otherwise, we just need the enabled value that can be found in homepageSettings.
type Parameters = FeatureSectionParameters | RegularSectionParameters;

type FeatureSectionParameters = {
  sectionEnabledSettingName: TAppConfigSectionSetting;
  appConfigSettingName: THomepageSetting;
};

type RegularSectionParameters = {
  sectionEnabledSettingName: TSectionSetting;
  appConfigSettingName?: never;
};

// If you just need to check the allowed value for appConfig settings,
// you should still use onlyCheckAllowed useFeatureFlag/FeatureFlag/GetFeatureFlag. This hook
// doesn't have this functionality implemented.
export default function useHomepageSettingsFeatureFlag({
  sectionEnabledSettingName,
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
    ? homepageSettings.data.attributes[sectionEnabledSettingName]
    : false;

  return isAllowed && isEnabled;
}
