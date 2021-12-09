import useAppConfiguration from 'hooks/useAppConfiguration';
import useFeatureFlag from 'hooks/useFeatureFlag';
import React from 'react';
import Layout1 from './Layout1';
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
        : 'layout_1';

    return (
      <>
        {homepageBannerLayout === 'layout_1' && <Layout1 />}
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
