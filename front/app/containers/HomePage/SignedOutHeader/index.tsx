import React from 'react';
import FullWidthBannerLayout from './FullWidthBannerLayout';
import { isNilOrError } from 'utils/helperUtils';
import Outlet from 'components/Outlet';
import useHomepageSettings from 'hooks/useHomepageSettings';
import useFeatureFlag from 'hooks/useFeatureFlag';

const SignedOutHeaderIndex = () => {
  const homepageSettings = useHomepageSettings();
  // Flag should not be here, but inside module (not sure now)
  const customizableHomepageBannerEnabled = useFeatureFlag({
    name: 'customizable_homepage_banner',
  });

  if (!isNilOrError(homepageSettings)) {
    const layoutSetting = homepageSettings.attributes.banner_layout;
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
          id="app.containers.HomePage.SignedOutHeader.index"
          homepageBannerLayout={homepageBannerLayout}
        />
      </>
    );
  }

  return null;
};

export default SignedOutHeaderIndex;
