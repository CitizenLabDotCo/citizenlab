import React from 'react';

import {
  HeaderImage,
  HeaderImageBackground,
  HeaderImageOverlay,
} from 'components/LandingPages/citizen/FullWidthBannerLayout';
import {
  Container,
  Header,
} from 'components/LandingPages/citizen/FixedRatioBannerLayout';
import HeaderContent from './HeaderContent';

import useHomepageSettings from 'hooks/useHomepageSettings';
import { isNilOrError } from 'utils/helperUtils';

const FixedRatioLayout = () => {
  const homepageSettings = useHomepageSettings();

  if (!isNilOrError(homepageSettings)) {
    const headerImage = homepageSettings.attributes.header_bg?.large;
    const homepageSettingColor =
      homepageSettings.attributes.banner_signed_out_header_overlay_color;
    const homepageSettingOpacity =
      homepageSettings.attributes.banner_signed_out_header_overlay_opacity;
    return (
      <Container>
        <Header>
          <HeaderImage>
            <HeaderImageBackground src={headerImage || null} />
            <HeaderImageOverlay
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

export default FixedRatioLayout;
