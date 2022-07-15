import useAppConfiguration from 'hooks/useAppConfiguration';
import useHomepageSettingsFeatureFlag from 'hooks/useHomepageSettingsFeatureFlag';
import React from 'react';
import FullWidthBannerLayout from './FullWidthBannerLayout';
import { isNilOrError } from 'utils/helperUtils';
import Outlet from 'components/Outlet';

const SignedOutHeaderIndex = () => {
  const appConfiguration = useAppConfiguration();
  // Flag should not be here, but inside module.
  const customizableHomepageBannerEnabled = useHomepageSettingsFeatureFlag({
    sectionEnabledSettingName: 'customizable_homepage_banner_enabled',
    appConfigSettingName: 'customizable_homepage_banner',
  });

  if (!isNilOrError(appConfiguration)) {
    const layoutSetting =
      appConfiguration.data.attributes.settings.customizable_homepage_banner
        ?.layout;
    // Mistake, we should rather use a mechanism similar to
    // navbarModuleActive. The core should not know about
    // a feature flag of a modularized feature.
    const homepageBannerLayout =
      customizableHomepageBannerEnabled && layoutSetting
        ? layoutSetting
        : 'full_width_banner_layout';

    return (
      <>
        {homepageBannerLayout === 'full_width_banner_layout' && (
          <FullWidthBannerLayout />
        )}
        <Outlet
          id="app.containers.LandingPage.SignedOutHeader.index"
          homepageBannerLayout={homepageBannerLayout}
        />
      </>
    );
  }

  return null;
};

export default SignedOutHeaderIndex;
