import React from 'react';
import {
  Container,
  Header,
  HeaderImage,
  HeaderImageBackground,
  HeaderImageOverlay,
} from 'components/LandingPages/citizen/FullWidthBannerLayout';
import HeaderContent from './HeaderContent';
import { IHomepageSettingsData } from 'services/homepageSettings';

interface Props {
  className?: string;
  homepageSettings: IHomepageSettingsData;
}

const FullWidthBannerLayout = ({ className, homepageSettings }: Props) => {
  const headerImage = homepageSettings.attributes.header_bg?.large;
  const homepageSettingColor =
    homepageSettings.attributes.banner_signed_out_header_overlay_color;
  const homepageSettingOpacity =
    homepageSettings.attributes.banner_signed_out_header_overlay_opacity;

  return (
    <Container
      data-testid="full-width-banner-layout"
      className={`e2e-signed-out-header ${className}`}
    >
      <Header id="hook-header">
        <HeaderImage id="hook-header-image">
          <HeaderImageBackground
            data-testid="full-width-banner-layout-header-image"
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

        <HeaderContent fontColors="light" />
      </Header>
    </Container>
  );
};

export default FullWidthBannerLayout;
