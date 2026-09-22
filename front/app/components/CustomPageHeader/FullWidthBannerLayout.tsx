import React, { ReactNode } from 'react';

import {
  Container,
  Header,
  HeaderImage,
  HeaderImageBackground,
  HeaderImageOverlay,
} from 'components/LandingPages/citizen/FullWidthBannerLayout';

import HeaderContent from './HeaderContent';
import { CustomPageBannerContent } from './types';

export interface Props {
  className?: string;
  banner: CustomPageBannerContent;
  adminEditButton?: ReactNode;
}

const FullWidthBannerLayout = ({
  className,
  banner,
  adminEditButton,
}: Props) => {
  const { imageUrl, overlayColor, overlayOpacity } = banner;

  return (
    <Container
      data-testid="full-width-banner-layout"
      className={`e2e-signed-out-header ${className}`}
    >
      <Header id="hook-header">
        <HeaderImage id="hook-header-image">
          <HeaderImageBackground
            data-cy="e2e-header-image-background"
            src={imageUrl}
          />
          {overlayColor && typeof overlayOpacity === 'number' && (
            <HeaderImageOverlay
              overlayColor={overlayColor}
              overlayOpacity={overlayOpacity}
            />
          )}
        </HeaderImage>
        <HeaderContent
          fontColors="light"
          hasHeaderBannerImage={imageUrl != null}
          banner={banner}
        />
      </Header>
      {adminEditButton}
    </Container>
  );
};

export default FullWidthBannerLayout;
