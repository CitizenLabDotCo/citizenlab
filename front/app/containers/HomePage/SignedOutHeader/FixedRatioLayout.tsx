import React from 'react';

import { IHomepageBannerSettings } from 'containers/Admin/pagesAndMenu/containers/ContentBuilder/components/Widgets/HomepageBanner';

import {
  Container,
  Header,
} from 'components/LandingPages/citizen/FixedRatioLayout';
import {
  HeaderImage,
  HeaderImageBackground,
  HeaderImageOverlay,
} from 'components/LandingPages/citizen/FullWidthBannerLayout';

import HeaderContent from './HeaderContent';

interface Props {
  homepageSettings: Partial<IHomepageBannerSettings>;
}

const FixedRatioLayout = ({ homepageSettings }: Props) => {
  const headerImage = homepageSettings.header_bg?.large;
  const homepageSettingColor =
    homepageSettings.banner_signed_out_header_overlay_color;
  const homepageSettingOpacity =
    homepageSettings.banner_signed_out_header_overlay_opacity;

  return (
    <Container
      data-testid="fixed-ratio-layout"
      data-cy="e2e-fixed-ratio-layout-container"
    >
      <Header>
        <HeaderImage data-cy="e2e-fixed-ratio-header-image">
          <HeaderImageBackground
            data-testid="fixed-ratio-layout-header-image-background"
            src={headerImage || null}
          />
          {homepageSettingColor &&
            typeof homepageSettingOpacity === 'number' && (
              <HeaderImageOverlay
                overlayColor={homepageSettingColor}
                overlayOpacity={homepageSettingOpacity}
              />
            )}
        </HeaderImage>

        <HeaderContent fontColors="light" homepageSettings={homepageSettings} />
      </Header>
    </Container>
  );
};

export default FixedRatioLayout;
