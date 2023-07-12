import React from 'react';
import FullWidthBannerLayout from './FullWidthBannerLayout';
import { isNilOrError } from 'utils/helperUtils';
import useHomepageSettings from 'api/home_page/useHomepageSettings';
import TwoColumnLayout from './TwoColumnLayout';
import TwoRowLayout from './TwoRowLayout';
import FixedRatioLayout from './FixedRatioLayout';

const SignedOutHeaderIndex = () => {
  const { data: homepageSettings } = useHomepageSettings();

  if (!isNilOrError(homepageSettings)) {
    const layoutSetting = homepageSettings.data.attributes.banner_layout;

    const homepageBannerLayout = layoutSetting
      ? layoutSetting
      : 'full_width_banner_layout';

    return (
      <>
        {homepageBannerLayout === 'full_width_banner_layout' && (
          <FullWidthBannerLayout homepageSettings={homepageSettings.data} />
        )}
        {homepageBannerLayout === 'two_column_layout' && (
          <TwoColumnLayout homepageSettings={homepageSettings.data} />
        )}
        {homepageBannerLayout === 'two_row_layout' && (
          <TwoRowLayout homepageSettings={homepageSettings.data} />
        )}
        {homepageBannerLayout === 'fixed_ratio_layout' && (
          <FixedRatioLayout homepageSettings={homepageSettings.data} />
        )}
      </>
    );
  }

  return null;
};

export default SignedOutHeaderIndex;
