import React from 'react';
import { ICustomPageAttributes } from 'services/customPages';

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
  imageColor?: string;
  imageOpacity?: number;
  pageAttributes: ICustomPageAttributes;
}

const FullWidthBannerLayout = ({
  className,
  imageColor,
  imageOpacity,
  pageAttributes,
}: Props) => {
  const imageUrl = pageAttributes.header_bg?.large;
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
          fontColors="light"
          hasHeaderBannerImage={imageUrl != null}
          pageAttributes={pageAttributes}
        />
      </Header>
    </Container>
  );
};

export default FullWidthBannerLayout;
