import React, { ReactNode } from 'react';

import { ICustomPageData } from 'api/custom_pages/types';

import {
  Container,
  Header,
  HeaderImage,
  HeaderImageBackground,
  HeaderImageOverlay,
} from 'components/LandingPages/citizen/FullWidthBannerLayout';

import HeaderContent from './HeaderContent';

export interface Props {
  className?: string;
  pageData: ICustomPageData;
  adminEditButton?: ReactNode;
}

const FullWidthBannerLayout = ({
  className,
  pageData,
  adminEditButton,
}: Props) => {
  const imageUrl = pageData.attributes.header_bg?.large;
  const overlayColor = pageData.attributes.banner_overlay_color;
  const overlayOpacity = pageData.attributes.banner_overlay_opacity;

  return (
    <Container
      data-testid="full-width-banner-layout"
      className={`e2e-signed-out-header ${className}`}
    >
      <Header id="hook-header">
        <HeaderImage id="hook-header-image">
          <HeaderImageBackground
            data-cy="e2e-header-image-background"
            src={imageUrl || null}
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
          pageAttributes={pageData.attributes}
        />
      </Header>
      {adminEditButton}
    </Container>
  );
};

export default FullWidthBannerLayout;
