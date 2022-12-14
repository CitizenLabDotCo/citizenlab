import React from 'react';

import {
  HeaderImage,
  HeaderImageBackground,
  HeaderImageOverlay,
} from 'components/LandingPages/citizen/FullWidthBannerLayout';
import HeaderContent from './HeaderContent';
import useHomepageSettings from 'hooks/useHomepageSettings';
import { isNilOrError } from 'utils/helperUtils';
import styled from 'styled-components';

import { media } from 'utils/styleUtils';
import { colors } from 'utils/styleUtils';

export const Container = styled.div`
  width: 100%;
  background: ${colors.background};
  padding-top: 24px;

  ${media.tablet`
    padding-top: 0;
  `}
`;

export const Header = styled.div`
  width: 100%;
  max-width: 1150px;
  min-height: 225px;
  margin: 0 auto;
  padding: 0;
  position: relative;
  aspect-ratio: 3 / 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  border-radius: ${(props) => props.theme.borderRadius};
`;

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
        <Header id="hook-header">
          <HeaderImage id="hook-header-image">
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
