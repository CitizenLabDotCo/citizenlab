import React from 'react';

import {
  HeaderImage,
  HeaderImageBackground,
  HeaderImageOverlay,
} from 'components/LandingPages/citizen/FullWidthBannerLayout';
import {
  Container,
  Header,
} from 'components/LandingPages/citizen/FixedRatioLayout';
import HeaderContent from './HeaderContent';

import { IHomepageSettingsData } from 'services/homepageSettings';

interface Props {
  homepageSettings: IHomepageSettingsData;
}

const FixedRatioLayout = ({ homepageSettings }: Props) => {
  const headerImage = homepageSettings.attributes.header_bg?.large;
  const homepageSettingColor =
    homepageSettings.attributes.banner_signed_out_header_overlay_color;
  const homepageSettingOpacity =
    homepageSettings.attributes.banner_signed_out_header_overlay_opacity;

  return (
    <Container data-testid="fixed-ratio-layout">
      <Header>
        <HeaderImage data-cy="e2e-fixed-ratio-header-image">
          <HeaderImageBackground
            data-testid="header-image-background"
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

        <HeaderContent fontColors="light" />
      </Header>
    </Container>
  );
};

export default FixedRatioLayout;
