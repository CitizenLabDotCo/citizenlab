import React from 'react';
import FullWidthBannerLayout from './FullWidthBannerLayout';
import { isNilOrError } from 'utils/helperUtils';
import useHomepageSettings from 'hooks/useHomepageSettings';
import useFeatureFlag from 'hooks/useFeatureFlag';
import TwoColumnLayout from './TwoColumnLayout';
import TwoRowLayout from './TwoRowLayout';

const SignedOutHeaderIndex = () => {
  const homepageSettings = useHomepageSettings();
  const customizableHomepageBannerEnabled = useFeatureFlag({
    name: 'customizable_homepage_banner',
  });

  if (!isNilOrError(homepageSettings)) {
    const layoutSetting = homepageSettings.attributes.banner_layout;

    const homepageBannerLayout =
      customizableHomepageBannerEnabled && layoutSetting
        ? layoutSetting
        : 'full_width_banner_layout';

    return (
      <>
        {homepageBannerLayout === 'full_width_banner_layout' && (
          <FullWidthBannerLayout />
        )}
        {homepageBannerLayout === 'two_column_layout' && <TwoColumnLayout />}
        {homepageBannerLayout === 'two_row_layout' && <TwoRowLayout />}
      </>
    );
  }

  return null;
};

export default SignedOutHeaderIndex;
