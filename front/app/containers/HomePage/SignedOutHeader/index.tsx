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
          <FullWidthBannerLayout />
        )}
        {homepageBannerLayout === 'two_column_layout' && <TwoColumnLayout />}
        {homepageBannerLayout === 'two_row_layout' && <TwoRowLayout />}
        {homepageBannerLayout === 'fixed_ratio_layout' && <FixedRatioLayout />}
      </>
    );
  }

  return null;
};

export default SignedOutHeaderIndex;
