import React from 'react';
import { isNilOrError } from 'utils/helperUtils';
import { homepageBannerLayoutHeights } from 'containers/Admin/pagesAndMenu/containers/HeroBanner/HeaderImageDropzone';

// components
import HeaderContent from './HeaderContent';

// style
import styled from 'styled-components';
import { media } from 'utils/styleUtils';

// hooks
import useHomepageSettings from 'hooks/useHomepageSettings';

const Container = styled.div`
  width: 100%;
  display: flex;
  flex-direction: column;
`;

const Header = styled.div`
  width: 100%;
  min-height: ${homepageBannerLayoutHeights.full_width_banner_layout.desktop}px;
  margin: 0;
  padding: 0;
  position: relative;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;

  ${media.smallerThanMaxTablet`
    min-height: ${homepageBannerLayoutHeights.full_width_banner_layout.tablet}px;
  `}

  ${media.smallerThanMinTablet`
    min-height: ${homepageBannerLayoutHeights.full_width_banner_layout.phone}px;
  `}
`;

const HeaderImage = styled.div`
  position: absolute;
  top: 0;
  bottom: 0;
  left: 0;
  right: 0;
`;

const HeaderImageBackground = styled.div<{ src: string | null }>`
  position: absolute;
  top: 0;
  bottom: 0;
  left: 0;
  right: 0;
  background-repeat: no-repeat;
  background-position: center center;
  background-size: cover;
  background-image: url(${({ src }) => src});
`;

const HeaderImageOverlay = styled.div<{
  overlayColor: string | null;
  overlayOpacity: number | null;
}>`
  background: ${({ overlayColor, theme }) => overlayColor ?? theme.colorMain};
  opacity: ${({ overlayOpacity, theme }) =>
    (overlayOpacity ?? theme.signedOutHeaderOverlayOpacity) / 100};
  position: absolute;
  top: 0;
  bottom: 0;
  left: 0;
  right: 0;
`;

export interface Props {
  className?: string;
}

const FullWidthBannerLayout = ({ className }: Props) => {
  const homepageSettings = useHomepageSettings();

  if (!isNilOrError(homepageSettings)) {
    const headerImage = homepageSettings.data.attributes.header_bg?.large;
    const homepageSettingColor =
      homepageSettings.data.attributes.banner_signed_out_header_overlay_color;
    const homepageSettingOpacity =
      homepageSettings.data.attributes.banner_signed_out_header_overlay_opacity;
    return (
      <Container className={`e2e-signed-out-header ${className}`}>
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

export default FullWidthBannerLayout;
