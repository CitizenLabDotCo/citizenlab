import useAppConfiguration from 'hooks/useAppConfiguration';
import useFeatureFlag from 'hooks/useFeatureFlag';
import React from 'react';
import FullWidthBannerLayout from './FullWidthBannerLayout';
import { isNilOrError } from 'utils/helperUtils';
import Outlet from 'components/Outlet';

const SignedOutHeaderIndex = () => {
  const appConfiguration = useAppConfiguration();
  const customizableHomepageBannerEnabled = useFeatureFlag({
    name: 'customizable_homepage_banner',
  });

  if (!isNilOrError(appConfiguration)) {
    const layoutSetting =
      appConfiguration.data.attributes.settings.customizable_homepage_banner
        ?.layout;
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
