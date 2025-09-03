import React from 'react';

import { IHomepageBannerSettings } from 'containers/Admin/pagesAndMenu/containers/ContentBuilder/components/Widgets/HomepageBanner';

import {
  Container,
  Header,
  HeaderImage,
  HeaderImageBackground,
  HeaderImageOverlay,
} from 'components/LandingPages/citizen/FullWidthBannerLayout';

import HeaderContent from './HeaderContent';

interface Props {
  className?: string;
  homepageSettings: Partial<IHomepageBannerSettings>;
}

const FullWidthBannerLayout = ({ className, homepageSettings }: Props) => {
  const headerImage = homepageSettings.header_bg?.large;
  const homepageSettingColor =
    homepageSettings.banner_signed_out_header_overlay_color;
  const homepageSettingOpacity =
    homepageSettings.banner_signed_out_header_overlay_opacity;

  return (
    <Container
      data-testid="full-width-banner-layout"
      data-cy="e2e-full-width-banner-layout-container"
      className={`e2e-signed-out-header ${className}`}
    >
      <Header id="hook-header">
        <HeaderImage id="hook-header-image">
          <HeaderImageBackground
            data-testid="full-width-banner-layout-header-image"
            data-cy="e2e-full-width-banner-layout-header-image"
            src={headerImage || null}
          />
          {homepageSettingColor &&
            typeof homepageSettingOpacity === 'number' && (
              <HeaderImageOverlay
                data-cy="e2e-full-width-layout-header-image-overlay"
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

export default FullWidthBannerLayout;
