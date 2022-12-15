import {
  Container,
  Header,
  HeaderImage,
  HeaderImageBackground,
  HeaderImageOverlay,
} from 'components/LandingPages/citizen/FullWidthBannerLayout';
import React from 'react';
import { isNilOrError } from 'utils/helperUtils';

// components
import HeaderContent from './HeaderContent';

// hooks
import useHomepageSettings from 'hooks/useHomepageSettings';

export interface Props {
  className?: string;
}

const FullWidthBannerLayout = ({ className }: Props) => {
  const homepageSettings = useHomepageSettings();

  if (!isNilOrError(homepageSettings)) {
    const headerImage = homepageSettings.attributes.header_bg?.large;
    const homepageSettingColor =
      homepageSettings.attributes.banner_signed_out_header_overlay_color;
    const homepageSettingOpacity =
      homepageSettings.attributes.banner_signed_out_header_overlay_opacity;
    return (
      <Container className={`e2e-signed-out-header ${className}`}>
        <Header id="hook-header">
          <HeaderImage id="hook-header-image">
            <HeaderImageBackground src={headerImage || null} />
            <HeaderImageOverlay
              data-cy="e2e-full-width-layout-header-image-overlay"
              overlayColor={homepageSettingColor}
              overlayOpacity={homepageSettingOpacity}
            />
          </HeaderImage>

          <HeaderContent fontColors="light" />
        </Header>
      </Container>
    );
  }

  return null;
};

export default FullWidthBannerLayout;
