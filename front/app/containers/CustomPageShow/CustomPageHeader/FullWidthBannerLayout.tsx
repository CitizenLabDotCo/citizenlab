import {
  Container,
  Header,
  HeaderImage,
  HeaderImageBackground,
  HeaderImageOverlay,
} from 'components/LandingPages/citizen/FullWidthBannerLayout';
import React from 'react';
import { ICustomPageData } from 'services/customPages';
import AdminCustomPageEditButton from './AdminCustomPageEditButton';
import HeaderContent from './HeaderContent';
export interface Props {
  className?: string;
  imageColor?: string;
  imageOpacity?: number;
  pageData: ICustomPageData;
}

const FullWidthBannerLayout = ({
  className,
  imageColor,
  imageOpacity,
  pageData,
}: Props) => {
  const imageUrl = pageData.attributes.header_bg?.large;

  return (
    <Container className={`e2e-signed-out-header ${className}`}>
      <Header id="hook-header">
        <HeaderImage id="hook-header-image">
          <HeaderImageBackground
            data-cy="e2e-header-image-background"
            src={imageUrl || null}
          />
          <HeaderImageOverlay
            overlayColor={imageColor}
            overlayOpacity={imageOpacity}
          />
        </HeaderImage>
        <HeaderContent
          fontColors="light"
          hasHeaderBannerImage={imageUrl != null}
          pageAttributes={pageData.attributes}
        />
      </Header>
      <AdminCustomPageEditButton pageId={pageData.id} />
    </Container>
  );
};

export default FullWidthBannerLayout;
