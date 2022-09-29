import React from 'react';
import { Multiloc } from 'typings';
import { homepageBannerLayoutHeights } from 'containers/Admin/pagesAndMenu/containers/GenericHeroBannerForm/HeaderImageDropzone';

// components
import HeaderContent from './HeaderContent';

// style
import styled from 'styled-components';
import { media } from 'utils/styleUtils';

// hooks

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
  overlayColor: string | null | undefined;
  overlayOpacity: number | null | undefined;
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
  imageUrl?: string;
  imageColor?: string;
  imageOpacity?: number;
  headerMultiloc: Multiloc;
  subheaderMultiloc: Multiloc;
}

const FullWidthBannerLayout = ({
  className,
  imageUrl,
  headerMultiloc,
  subheaderMultiloc,
  imageColor,
  imageOpacity,
}: Props) => {
  return (
    <Container className={`e2e-signed-out-header ${className}`}>
      <Header id="hook-header">
        <HeaderImage id="hook-header-image">
          <HeaderImageBackground src={imageUrl || null} />
          <HeaderImageOverlay
            data-cy="e2e-full-width-layout-header-image-overlay"
            overlayColor={imageColor}
            overlayOpacity={imageOpacity}
          />
        </HeaderImage>

        <HeaderContent
          headerMultiloc={headerMultiloc}
          subheaderMultiloc={subheaderMultiloc}
          hasHeaderBannerImage={imageUrl != null}
          fontColors="light"
        />
      </Header>
    </Container>
  );
};

export default FullWidthBannerLayout;
