import React from 'react';

import { IHomepageBannerSettings } from 'containers/Admin/pagesAndMenu/containers/ContentBuilder/components/Widgets/HomepageBanner';

import { TitleVariant } from 'components/admin/ContentBuilder/Widgets/_shared/TitleVariantSetting';

import FixedRatioLayout from './FixedRatioLayout';
import FullWidthBannerLayout from './FullWidthBannerLayout';
import TwoColumnLayout from './TwoColumnLayout';
import TwoRowLayout from './TwoRowLayout';

const SignedOutHeaderIndex = ({
  homepageSettings,
  titleVariant,
}: {
  homepageSettings: Partial<IHomepageBannerSettings>;
  titleVariant?: TitleVariant;
}) => {
  const layoutSetting = homepageSettings.banner_layout;

  const homepageBannerLayout = layoutSetting
    ? layoutSetting
    : 'full_width_banner_layout';

  return (
    <>
      {homepageBannerLayout === 'full_width_banner_layout' && (
        <FullWidthBannerLayout
          homepageSettings={homepageSettings}
          titleVariant={titleVariant}
        />
      )}
      {homepageBannerLayout === 'two_column_layout' && (
        <TwoColumnLayout
          homepageSettings={homepageSettings}
          titleVariant={titleVariant}
        />
      )}
      {homepageBannerLayout === 'two_row_layout' && (
        <TwoRowLayout
          homepageSettings={homepageSettings}
          titleVariant={titleVariant}
        />
      )}
      {homepageBannerLayout === 'fixed_ratio_layout' && (
        <FixedRatioLayout
          homepageSettings={homepageSettings}
          titleVariant={titleVariant}
        />
      )}
    </>
  );
};

export default SignedOutHeaderIndex;
