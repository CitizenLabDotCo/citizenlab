import React from 'react';
import { Multiloc } from 'typings';

// components
import HeaderContent from './HeaderContent';
import {
  HeaderImageBackground,
  Container,
  Header,
  HeaderImage,
  HeaderImageOverlay,
} from 'containers/LandingPage/SignedOutHeader/FullWidthBannerLayout';

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
