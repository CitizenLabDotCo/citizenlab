import React from 'react';
import FullWidthBannerLayout from './FullWidthBannerLayout';
import { isNilOrError } from 'utils/helperUtils';
import useHomepageSettings from 'hooks/useHomepageSettings';
import TwoColumnLayout from './TwoColumnLayout';
import TwoRowLayout from './TwoRowLayout';
import FixedRatioLayout from './FixedRatioLayout';

const SignedOutHeaderIndex = () => {
  const homepageSettings = useHomepageSettings();

  if (!isNilOrError(homepageSettings)) {
    const layoutSetting = homepageSettings.attributes.banner_layout;

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
  }

  return null;
};

export default SignedOutHeaderIndex;
