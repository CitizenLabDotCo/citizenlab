import React from 'react';

import { IHomepageBannerSettings } from 'containers/Admin/pagesAndMenu/containers/ContentBuilder/components/Widgets/HomepageBanner';

import FixedRatioLayout from './FixedRatioLayout';
import FullWidthBannerLayout from './FullWidthBannerLayout';
import TwoColumnLayout from './TwoColumnLayout';
import TwoRowLayout from './TwoRowLayout';

const SignedOutHeaderIndex = ({
  homepageSettings,
}: {
  homepageSettings: Partial<IHomepageBannerSettings>;
}) => {
  const layoutSetting = homepageSettings.banner_layout;

  const homepageBannerLayout = layoutSetting
    ? layoutSetting
    : 'full_width_banner_layout';

  return (
    <>
      {homepageBannerLayout === 'full_width_banner_layout' && (
        <FullWidthBannerLayout homepageSettings={homepageSettings} />
      )}
      {homepageBannerLayout === 'two_column_layout' && (
        <TwoColumnLayout homepageSettings={homepageSettings} />
      )}
      {homepageBannerLayout === 'two_row_layout' && (
        <TwoRowLayout homepageSettings={homepageSettings} />
      )}
      {homepageBannerLayout === 'fixed_ratio_layout' && (
        <FixedRatioLayout homepageSettings={homepageSettings} />
      )}
    </>
  );
};

export default SignedOutHeaderIndex;
